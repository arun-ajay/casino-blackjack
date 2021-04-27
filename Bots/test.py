import sqlite3


connection = sqlite3.connect("blackjack.db")
cursor = connection.cursor()
cursor.execute("SELECT * FROM GAMEDATA WHERE [ADR]  = ?",('0x2372F830e274e0f4B5CD7710d519B60eA06007CB',))

data = cursor.fetchone()

print(data[1])