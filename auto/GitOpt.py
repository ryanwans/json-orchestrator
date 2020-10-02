#!/usr/bin/env python

import subprocess
import time

class Git:
    def __init__(self, branch):
        self.branch = branch
        print("Git Object Initialized")
    def pull(self):
        cmd = ["git", "pull", "origin", self.branch]
        process = subprocess.Popen(cmd, stdout=subprocess.PIPE)
        time.sleep(3)
        output = process.communicate()[0]
        return output
    def push(self):
        add = ["git", "add", "-A"]
        commit = ["git", "commit", "-m", "RyanAutoPush"]
        push = ["git", "push", "origin", self.branch]
        subprocess.Popen(add, stdout=subprocess.PIPE)
        time.sleep(1)
        subprocess.Popen(commit, stdout=subprocess.PIPE)
        time.sleep(1)
        process = subprocess.Popen(push, stdout=subprocess.PIPE)
        time.sleep(1)
        return process.communicate()[0]
    
def echo(mes):
    process = subprocess.Popen(["echo", mes], stdout=subprocess.PIPE)
    return process.communicate()[0]

def push():
    git = Git("master")
    time.sleep(1)
    git.push()

def pull():
    git = Git("master")
    time.sleep(1)
    git.pull()

def say(mes):
    echo(mes)