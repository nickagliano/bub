def sendCommand(command, data):
    """
    Data can be a list or a single datum.
    All data will be automatically converted to strings.
    """
    if type(data) is list:
        print(command + "|" + "|".join(map(str, data)))
    else:
        print(command + "|" + str(data))

def awaitCommand():
    """
    Will return a tuple in the form (command, data), where data is a list of strings.
    """
    msg = input()
    tokens = msg.split("|")
    return tokens[0], tokens[1:]