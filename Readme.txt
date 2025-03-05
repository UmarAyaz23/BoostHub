1. Make a new SQL Developer connection and run "DBSProjectScript.sql", also install flask and oracledb libraries for python (pip install flask oracledb)
2. Go to app.py and insert your hostname, port, and service name in "dsn = oracledb.makedsn('localhost', '1521', 'orcl')"
3. Also insert your connection's username and password in "connection = oracledb.connect(user='system', password='Uit54321', dsn=dsn)"
4. Save all, re-launch SQL Developer and connect to the connection you made 
5. Go to commandline, change directory to whereever you are going to store the project file
6. type in "python app.py"
7. Copy the website link "http...."
8. Paste it into your browser and enter