from automate.misc import read, write
from re import sub
# Both functions add an extra newline to the end of the file.
# This is because I could not figure out how regular expressions work and made it look up until '\n'
# Instead of line ends. should be $ for line end, but whatever.
# If there is a singe line comment on the last line of the file, the extra newline doesn't show up.

# Takes a file location. removes comments from JavaScript files. edits the file. returns the new file
def remove_comments_file(loc: str) -> str:
    write(loc, sub("/\\*(.|\\s)*?\\*/", '', sub("//.*\n?", '\n', read(loc)+'\n')), 'w')
    return read(loc)

# Takes a file location. removes comments from JavaScript files. does not edit the file. returns the file without comments
def remove_comments_str(loc: str) -> str:
    return sub("/\\*(.|\\s)*?\\*/", '', sub("//.*\n?", '\n', read(loc)+'\n'))
