---
layout: post
title: "Reverse sort order of a multicolumn file in BASH"
date: 2018-06-13 10:42:12.000000000 +02:00
tags:
- Bash
- Hacks
- Tips/Tricks
---

# Reverse sort order of a multicolumn file in BASH

I wanted to do some code clean up with [flake8](https://pypi.org/project/flake8/) and in the midst of it all I wanted to start bottoms up, that way I do not have to re-run flake everytime I make a change as it would eventually messes with the line numbers.
Reason for doing all this, is that code that isn't [PEP8](https://www.python.org/dev/peps/pep-0008/) gives me goosebumps, some might say I have OCD on non-[PEP8](https://www.python.org/dev/peps/pep-0008/) code

## Flake8 results from top-bottom

```
mmphego@cmc3:~/src/mkat_fpga_tests (corr2-devel-bug-fixes)
└─ [2018-06-13 10:12:04] $ >>> flake8 --config=.flake8 mkat_fpga_tests/test_cbf.py

mkat_fpga_tests/test_cbf.py:1695:37: E226 missing whitespace around arithmetic operator
mkat_fpga_tests/test_cbf.py:1748:52: E226 missing whitespace around arithmetic operator
mkat_fpga_tests/test_cbf.py:1794:59: E226 missing whitespace around arithmetic operator
mkat_fpga_tests/test_cbf.py:1814:87: E226 missing whitespace around arithmetic operator
mkat_fpga_tests/test_cbf.py:1840:37: E121 continuation line under-indented for hanging indent
mkat_fpga_tests/test_cbf.py:1921:56: E226 missing whitespace around arithmetic operator
mkat_fpga_tests/test_cbf.py:1921:83: E226 missing whitespace around arithmetic operator
mkat_fpga_tests/test_cbf.py:2032:121: E501 line too long (124 > 120 characters)
mkat_fpga_tests/test_cbf.py:2048:121: E501 line too long (158 > 120 characters)
mkat_fpga_tests/test_cbf.py:2209:121: E501 line too long (125 > 120 characters)
mkat_fpga_tests/test_cbf.py:2214:121: E501 line too long (125 > 120 characters)
mkat_fpga_tests/test_cbf.py:2217:121: E501 line too long (122 > 120 characters)
mkat_fpga_tests/test_cbf.py:2384:13: F841 local variable 'dsim_set_success' is assigned to but never used
mkat_fpga_tests/test_cbf.py:2434:13: F841 local variable 'bls_to_plot' is assigned to but never used
mkat_fpga_tests/test_cbf.py:2438:13: F841 local variable '_' is assigned to but never used

```

## Flake8 results from bottom-top(reversed)
After some Googling...

```
sort -nrk 2,2
# n for numeric sorting, r for reverse order and k 2,2 for the second column.
# or
# sort -r # [man sort](http://www.man7.org/linux/man-pages/man1/sort.1.html)
```
does the trick, you just need to pipe the results to sort.


```
mmphego@cmc3:~/src/mkat_fpga_tests (corr2-devel-bug-fixes)
└─ [2018-06-13 10:37:26] $ >>> flake8 --config=.flake8 mkat_fpga_tests/test_cbf.py | sort -nrk 2,2
mkat_fpga_tests/test_cbf.py:7634:28: E226 missing whitespace around arithmetic operator
mkat_fpga_tests/test_cbf.py:7610:54: E226 missing whitespace around arithmetic operator
mkat_fpga_tests/test_cbf.py:7590:39: E226 missing whitespace around arithmetic operator
mkat_fpga_tests/test_cbf.py:7590:36: E226 missing whitespace around arithmetic operator
mkat_fpga_tests/test_cbf.py:7590:23: E226 missing whitespace around arithmetic operator
mkat_fpga_tests/test_cbf.py:7590:20: E226 missing whitespace around arithmetic operator
mkat_fpga_tests/test_cbf.py:7588:73: E226 missing whitespace around arithmetic operator
mkat_fpga_tests/test_cbf.py:7588:71: E226 missing whitespace around arithmetic operator
mkat_fpga_tests/test_cbf.py:7588:66: E226 missing whitespace around arithmetic operator
mkat_fpga_tests/test_cbf.py:7586:48: E226 missing whitespace around arithmetic operator
mkat_fpga_tests/test_cbf.py:7586:45: E226 missing whitespace around arithmetic operator
mkat_fpga_tests/test_cbf.py:7586:41: E226 missing whitespace around arithmetic operator
mkat_fpga_tests/test_cbf.py:7584:31: E226 missing whitespace around arithmetic operator
mkat_fpga_tests/test_cbf.py:7584:28: E226 missing whitespace around arithmetic operator
mkat_fpga_tests/test_cbf.py:7584:25: E226 missing whitespace around arithmetic operator
mkat_fpga_tests/test_cbf.py:7565:44: E226 missing whitespace around arithmetic operator
mkat_fpga_tests/test_cbf.py:7564:44: E226 missing whitespace around arithmetic operator
```
