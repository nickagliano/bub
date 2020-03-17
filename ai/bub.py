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
# import asyncio

env_name = "pokemon-v0"
env = gym.make(env_name)
tf.disable_eager_execution()

# print("python: ", platform.python_version())
# print("tensorflow: ", tf.__version__)
# print("gym: ", gym.__version__)
# print("numpy: ", np.__version__)

def talk(command, data):
    print(command + "|" + data)

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
    talk("debug", "hi im bub")
    
    agent = DQNAgent(env)
    num_battles = 0

    while num_battles < 100: 
        # add -- code to find a battle
        # add -- start battle timer
        
        msg = input()
        # interpret initial state!
        #     we expect a string of numbers separated by commas to turn into our state
        state = env.reset(list(map(int, msg.split("|")[1].split(",")))) 
        
        total_reward = 0
        done = False
        while not done: # a single battle
            action = agent.get_action(state)
            # next_state, reward, done, info = env.step(action) # old step func call
            next_state, reward, done = env.step(action) # new step func call, without info
            agent.train(state, action, next_state, reward, done)
            env.render()
            total_reward += reward
            state = next_state
            
        num_battles += 1
        
        print("debug|Episode: {}, total_reward: {:.2f}".format(num_battles, total_reward))
