VPN 10.100.98.240

NONVPN 10.101.114.253

-u splunk
-p fluctuation causing fig stand

sourcetype=test | eval c_time=strftime(log_time,"%m/%d/%y %H:%M:%S") | table _time, c_time