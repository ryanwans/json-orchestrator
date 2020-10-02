#!/usr/bin/env python

import time
import GitOpt

continueThread = True

def MainLoop(delay):
    while continueThread:
        GitOpt.pull()
        GitOpt.push()
        GitOpt.say("Currated pull request to git repo!")
        time.sleep(delay)
        if(not continueThread):
            break

def Break():
    continueThread = False

MainLoop(120)