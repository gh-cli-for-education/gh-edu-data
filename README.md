This plugin for the ``gh-edu`` exosystem has been created to manage and store various student information. It has three
main commands: log, teams and team-add.

## Installation
```
gh edu install log
```

## log
The main purpose of the log is to link a student's institutional account to his or her GitHub account
GitHub account and get extra information that can be useful to the teacher.
teacher.
An initial file with information that the teacher has about the students is needed.
This input file has to be of JSON type, with an array where each element stores information about the students.
stores information about the students. This information has to contain at least the
name of the student, although it is appropriate that it contains the name and an identifier.
It can have more data.
Once the command is executed, the teacher decides which fields he/she wants to have for each student.
student. And which of the incoming fields correspond to the name and, if any, the identifier.
the identifier. Then, one by one, and taking advantage of the efficient fzf interface and the preview of the student's remote data, the student in question is filtered in question.
As a result, a new JSON file is obtained, containing the information initially provided by the teacher
the teacher, combined with the data provided by GitHub
