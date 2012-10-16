self.cc
===========

This is a c++ program that prints itself (its own source code). The idea is rather simple, and it is just a matter of figuring out the indirection and how to properly escape the characters. 

The problem itself should take around a half hour to finish up, so it is something I recommend you try if you haven't had the chance to yet.


g++ self.cc -o self
./self > myself
diff self.cc myself

