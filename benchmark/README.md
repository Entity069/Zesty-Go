# Benchmarks

This benchmarking is done to check efficiency of several API routes

## Prerequisites

- Clone repo and install project related dependencies

- Install Apache Bench
```bash
sudo apt install && sudo apt install apache2-utils
```

Few benchmarks are perfomed are given below.
The benchmarks were performed on a machine with Intel(R) Core(TM) i7-14700HX (20 Cores, 28 Threads) with 16 Gigabytes of RAM.


## GET /api/order/all-items

An in-memory cache has been implemented to store items, on this route.

Before caching:

```
This is ApacheBench, Version 2.3 <$Revision: 1913912 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking localhost (be patient)
Completed 10000 requests
Completed 20000 requests
Completed 30000 requests
Completed 40000 requests
Completed 50000 requests
Completed 60000 requests
Completed 70000 requests
Completed 80000 requests
Completed 90000 requests
Completed 100000 requests
Finished 100000 requests


Server Software:
Server Hostname:        localhost
Server Port:            3001

Document Path:          /api/order/all-items
Document Length:        5231 bytes

Concurrency Level:      1000
Time taken for tests:   6.561 seconds
Complete requests:      100000
Failed requests:        0
Total transferred:      531900000 bytes
HTML transferred:       523100000 bytes
Requests per second:    15241.97 [#/sec] (mean)
Time per request:       65.608 [ms] (mean)
Time per request:       0.066 [ms] (mean, across all concurrent requests)
Transfer rate:          79171.90 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0   28  98.5     19    1058
Processing:     1   35  18.7     34     267
Waiting:        1   28  17.1     27     256
Total:          1   63 101.5     55    1147

Percentage of the requests served within a certain time (ms)
  50%     55
  66%     64
  75%     69
  80%     71
  90%     78
  95%     85
  98%    111
  99%    262
 100%   1147 (longest request)
```

After caching:

```
This is ApacheBench, Version 2.3 <$Revision: 1913912 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking localhost (be patient)
Completed 10000 requests
Completed 20000 requests
Completed 30000 requests
Completed 40000 requests
Completed 50000 requests
Completed 60000 requests
Completed 70000 requests
Completed 80000 requests
Completed 90000 requests
Completed 100000 requests
Finished 100000 requests


Server Software:
Server Hostname:        localhost
Server Port:            3001

Document Path:          /api/order/all-items
Document Length:        5231 bytes

Concurrency Level:      1000
Time taken for tests:   3.645 seconds
Complete requests:      100000
Failed requests:        0
Total transferred:      531900000 bytes
HTML transferred:       523100000 bytes
Requests per second:    27436.34 [#/sec] (mean)
Time per request:       36.448 [ms] (mean)
Time per request:       0.036 [ms] (mean, across all concurrent requests)
Transfer rate:          142513.57 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0   20  96.6     10    1047
Processing:     0   14  18.8     12     238
Waiting:        0   10  18.6      8     233
Total:          0   35  98.8     22    1066

Percentage of the requests served within a certain time (ms)
  50%     22
  66%     24
  75%     28
  80%     32
  90%     37
  95%     39
  98%     49
  99%    235
 100%   1066 (longest request)
```

#### Summary
Using caching increased throughput from 15,241.97 r/s to 27,436.34 r/s (~80% increase) and reduced total test time from 6.561s to 3.645s (~45% decrease). Median latency fell from 55ms to 22ms (~60% decrease) and mean time per request fell from 65.608ms to 36.448ms (~45% decrease).