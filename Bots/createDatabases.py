import sqlite3

connection = sqlite3.connect(r".\blackjack.db")
cursor = connection.cursor()
cursor.execute(" CREATE TABLE IF NOT EXISTS GAMEDATA (ADR TEXT, RCOM TEXT, RD TEXT, HASH TEXT, RP TEXT)")
connection.commit()