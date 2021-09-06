#!/usr/bin/python3
import sys
sys.path.append("./")
import cvd_common

if __name__ == '__main__':
    print("Content-Type: application/json\r\n\r")
    sys.except_hook = cvd_common.error_exit
    injson = json.load(sys.stdin)
    print json.dumps(result)

