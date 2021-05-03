import sqlite3

connection = sqlite3.connect("blackjack.db")
cursor = connection.cursor()
cursor.execute(" CREATE TABLE IF NOT EXISTS GAMEDATA (ADR TEXT, RCOM1 TEXT, RCOM2 TEXT, RCOM1HASH TEXT, RCOM2HASH TEXT, RP1 TEXT, RP2 TEXT)")
connection.commit()