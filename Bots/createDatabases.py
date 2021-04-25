import sqlite3

connection = sqlite3.connect(r".\blackjack.db")
cursor = connection.cursor()
cursor.execute("SELECT name from sqlite_master WHERE type = 'table';")

tableList = []
flag = False

for table in cursor.fetchall():
    tableList.append(str(table[0]))


cursor.execute(" CREATE TABLE IF NOT EXISTS GAMEDATA (ADR TEXT, RCOM TEXT, RD TEXT, HASH TEXT, RP TEXT)")
