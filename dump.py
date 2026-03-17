import os
import sys

# Change directory
os.chdir(os.path.join(os.path.dirname(__file__), '..', 'gym_management'))

# Run manage.py check and capture all output to a file
import subprocess
with open('error_log_full.txt', 'w') as f:
    subprocess.run([sys.executable, 'manage.py', 'check'], stdout=f, stderr=subprocess.STDOUT)
