import sqlite3

connection = sqlite3.connect("blackjack.db")
cursor = connection.cursor()
cursor.execute(" CREATE TABLE IF NOT EXISTS GAMEDATA (ADR TEXT, RCOM TEXT, RD TEXT, HASH BLOB, RP TEXT)")
connection.commit()