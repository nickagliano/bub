import sys
import json
import tensorflow.compat.v1 as tf
import gym
import random
import platform
from collections import deque
import numpy as np
import gym_pokemon.gym_pokemon as gym_pokemon
import gym_pokemon.gym_pokemon.envs as gym_env
from communicator import *

env_name = "pokemon-v0"
env = gym.make(env_name)
tf.disable_eager_execution()

# print("python: ", platform.python_version())
# print("tensorflow: ", tf.__version__)
# print("gym: ", gym.__version__)
# print("numpy: ", np.__version__)

class QNetwork():
    def __init__(self, state_dim, action_size):
        self.state_in = tf.placeholder(tf.float32, shape=[None, *state_dim])
        self.action_in = tf.placeholder(tf.int32, shape=[None])
        self.q_target_in = tf.placeholder(tf.float32, shape=[None])
        action_one_hot = tf.one_hot(self.action_in, depth=action_size)
        
        self.hidden1 = tf.layers.dense(self.state_in, 100, activation=tf.nn.relu)
        self.q_state = tf.layers.dense(self.hidden1, action_size, activation=None)
        self.q_state_action = tf.reduce_sum(tf.multiply(self.q_state, action_one_hot), axis=1)
        
        self.loss = tf.reduce_mean(tf.square(self.q_state_action - self.q_target_in))
        self.optimizer = tf.train.AdamOptimizer(learning_rate=0.001).minimize(self.loss)
      
    def update_model(self, session, state, action, q_target):
        feed = {self.state_in: state, self.action_in: action, self.q_target_in: q_target}
        session.run(self.optimizer, feed_dict=feed)
    
    def get_q_state(self, session, state):
        q_state = session.run(self.q_state, feed_dict={self.state_in: state})
        return q_state
        
class ReplayBuffer():
    def __init__(self, maxlen):
        self.buffer = deque(maxlen=maxlen)
        
    def add(self, experience):
        self.buffer.append(experience)
        
    def sample(self, batch_size):
        sample_size = min(len(self.buffer), batch_size)
        samples = random.choices(self.buffer, k=sample_size)
        return map(list, zip(*samples))

class DQNAgent():
    def __init__(self, env):
        self.state_dim = env.observation_space.shape
        self.action_size = env.action_space.n
        self.q_network = QNetwork(self.state_dim, self.action_size)
        self.replay_buffer = ReplayBuffer(maxlen=10000)
        self.gamma = 0.97
        self.eps = 1.0
        self.sess = tf.Session()
        self.sess.run(tf.global_variables_initializer())
        
    def get_action(self, state):
        q_state = self.q_network.get_q_state(self.sess, [state])
        action_greedy = np.argmax(q_state)
        action_random = np.random.randint(self.action_size)
        action = action_random if random.random() < self.eps else action_greedy
        return action
    
    def train(self, state, action, next_state, reward, done):
        self.replay_buffer.add((state, action, next_state, reward, done))
        states, actions, next_states, rewards, dones = self.replay_buffer.sample(50)
        q_next_states = self.q_network.get_q_state(self.sess, next_states)
        q_next_states[dones] = np.zeros([self.action_size])
        q_targets = rewards + self.gamma * np.max(q_next_states, axis=1)
        self.q_network.update_model(self.sess, states, actions, q_targets)
        
        if done: self.eps = max(0.1, 0.99*self.eps)
    
    def __del__(self):
        self.sess.close()

if __name__ == "__main__":
    sendCommand("debug", "hi im bub")
    
    agent = DQNAgent(env)
    num_battles = 0
    states = dict() # map room ids to states
    actions = dict() # map room ids to actions

    while True:
        command, data = awaitCommand()
        roomId = data[0]
        data = data[1:] # will hold any extra info beyond room id now
        next_state = None

        if roomId in states:
            next_state = states[roomId] # if state doesnt change we default to prev state

        # sendCommand("debug", "/" + str(command is "state") + "/" + str(command == "state"))

        if command == "state":
            next_state, reward, wasReset = env.receiveNewState(roomId, data[0].split(","))
            # sendCommand("debug", "pee" + ",".join(next_state))
        elif command == "error": # bub messed up OOOPS!!
            reward = env.receiveError(roomId)
        elif command == "done":
            env.receiveDone(roomId, data[0] == "win")
            sendCommand("debug", "Episode: {}, total_reward: {:.2f}".format(num_battles, env.rewards[roomId]))
            num_battles += 1

        if roomId in actions: # don't run for first state
            agent.train(states[roomId], actions[roomId], next_state, reward, env.dones[roomId])
        states[roomId] = next_state

        if not env.dones[roomId]:
            actions[roomId] = agent.get_action(next_state)
            sendCommand("action", [ roomId, actions[roomId] ])
        else: # lets clear some stuff out bc we're done
            del actions[roomId]
            del states[roomId]
            env.clear(roomId)
