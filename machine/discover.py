#!/usr/bin/python3
import sys
import json
import os
import time
sys.path.append("./")
import cvdlib


if __name__ == '__main__':
    print("Expires: Sat, 01 Jan 1969 00:00:01 GMT\r")
    print("Cache-Control: post-check=0, pre-check=0, max-age=0\r")
    print("Content-Type: application/json\r\n\r")
    sys.excepthook = cvdlib.error_exit
    error_out = cvdlib.error_out
    injson = json.load(sys.stdin)
    engine = os.path.basename(__file__).replace(".py","")
    fresult = {"current_engine": engine}
    if "document_type" in injson:
        sname = cvdlib.safe_filename(injson["document_type"])
        if not engine in cvdlib.schemator:
            error_out("Engine requested is not valid %s "%(engine))
        if sname != cvdlib.schemator[engine][0]:
            error_out("Schema check cannot find output template %s %s !"
                      %(sname,cvdlib.schemator[engine][0]))
        output = cvdlib.schemator[engine][1]
        fp = open("../schema/%s.schema.json" %(sname),"r")
        schema_doc = json.load(fp)
        if cvdlib.jsonvalidation(injson,schema_doc) == True:
            fresult["validated"] = True
            fresult["timestamp"] = int(time.time())
            fsearch = injson["search"]
            fresult["inputs"] = fsearch
            fresult["stakeholders"] = []
            if "title" in injson:
                fresult["title"] = injson["title"]
            fo = open("../data/%s.json" %(output), "r")
            out_doc = json.load(fo)
            for f in fsearch:
                for s in out_doc["stakeholders"]:
                    if f["vendor"] == s["name"] or s["type"] == "CERT":
                        fresult["stakeholders"].append(s)
    print(json.dumps(fresult))
    

