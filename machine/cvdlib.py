#!/usr/bin/python3
import sys
import json
import os
import syslog
import jsonschema
from jsonschema import validate
from jsonschema import Draft4Validator

syslog.openlog(ident="cvd_machine",logoption=syslog.LOG_PID,
               facility=syslog.LOG_USER)
schemator = {"discover": ["vendor_search", "report_methods"],
             "reporting": ["vul_report", "vul_coordinate"],
             "triage": ["vul_coordinate", "vul_remediate"],
             "remediation": ["vul_remediate", "vul_notice"],
             "public_awareness": ["vul_notice",  "vul_metrics"]}

def error_out(errmsg,backend=None):
    err = {"error": errmsg}
    if backend != None:
        err["backend"] = backend
    print(json.dumps(err))
    sys.exit(1)

def error_exit(ex_cls, ex, tb):
    addition_err = "Syslog interface"
    f = tb.tb_frame
    lineno = tb.tb_lineno
    filename = f.f_code.co_filename
    addition_err += str(ex)+str(ex_cls)+str(tb)
    remote_ip = "Local-or-Unknown"
    if 'REMOTE_ADDR' in os.environ:
        remote_ip = os.environ['REMOTE_ADDR']
    syslog.syslog('Error line No. '+str(lineno)+', Filename: '+filename+
                  ',error'+str(ex)+', IP: '+remote_ip)
    error_out(str(ex))


def jsonvalidation(json_doc, schema_doc):
    try:
        validate(json_doc, schema_doc)
        return True
    except jsonschema.exceptions.ValidationError as incorrect:
        v = Draft4Validator(schema_doc)
        errors = sorted(v.iter_errors(json_doc), key=lambda e: e.path)
        for error in errors:
            sys.stderr.write("Record did not pass: \n")
            sys.stderr.write(str(error.message) + "\n")
        error_out("Schema validation failed",errors);

def safe_filename(ifname):
    return ifname.replace("..","").replace("/","").replace("\\","").replace("\00","").replace("|","")

