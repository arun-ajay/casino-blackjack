import flask
import json
import sqlite3
from flask import jsonify, request
from flask_cors import CORS, cross_origin


# ----- WEB3.PY SETUP ----- #
from web3 import Web3
import config
import random
import time
import asyncio
w3 = Web3(Web3.HTTPProvider(config.infuraProvider))
accounts = w3.eth.account.privateKeyToAccount(config.casinoPrivateKey)
account = accounts.address
smartContractAddress= Web3.toChecksumAddress(config.smartContractAddress)

casinoContract = w3.eth.contract(address= smartContractAddress, abi= config.abi)
nonce = w3.eth.getTransactionCount(account) + 400
# ----- END OF WEB3.PY SETUP ----- #



app = flask.Flask(__name__)
CORS(app, support_credentials = False)
app.config["DEBUG"] = True

def build_preflight_response():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add('Access-Control-Allow-Headers', "*")
    response.headers.add('Access-Control-Allow-Methods', "*")
    return response

def getGameState(address):

    return casinoContract.functions.mapGamestate(address).call({
        'from': account
    })


@app.route('/sendrp',methods = ["POST"])
@cross_origin()
def sendrp():
    if request.method == "OPTIONS":
        return build_preflight_response()

    elif request.method == "POST":
        try:
            jsonData = request.json
            address = jsonData["address"]
            rp = jsonData["rp"]
            connection = sqlite3.connect(r"./blackjack.db")
            cursor = connection.cursor()
            cursor.execute("SELECT * FROM GAMEDATA WHERE [ADR] = ?",(address,))

            gameState = getGameState(address)

            if gameState != 1:
                body = {
                    "Message": "You are not supposed to send an rp yet!"
                }
                return jsonify(body),400
            else:
                dbData = cursor.fetchone()

                if dbData is None:
                    body = {
                        "Message": "Your hash isn't ready yet!"
                    }
                    return jsonify(body),400
                elif len(dbData[4]) != 0:
                    body = {
                        "Message": "You have already sent us your rp."
                    }
                    return jsonify(body),400
                else:
                    dbData = list(dbData)
                    dbData[4] = rp
                    cursor.execute("DELETE FROM GAMEDATA WHERE [ADR] = ?",(address,))
                    connection.commit()
                    cursor.execute("INSERT INTO GAMEDATA VALUES(?,?,?,?,?)", tuple(dbData))
                    connection.commit()
                    body = {
                        "Message": "We've received your rp!"
                    }
                    return jsonify(body),200

            return jsonify(body),200
        except Exception as e:
            print(str(e))
    

@app.route('/gethash',methods = ["POST"])
@cross_origin()
def getHash():
    if request.method == "OPTIONS":
        return build_preflight_response()

    elif request.method == "POST":
        try:
            jsonData = request.json
            address = jsonData["address"]
            connection = sqlite3.connect(r"./blackjack.db")
            cursor = connection.cursor()
            cursor.execute("SELECT * FROM GAMEDATA WHERE [ADR] = ?",(address,))

            gameState = getGameState(address)

            if gameState != 1:
                body = {
                    "Message": "It is not possible to receive your hash as this time."
                }
                return jsonify(body),400
            else:
                dbData = cursor.fetchone()

                if dbData is None:
                    body = {
                        "Message": "Your hash isn't ready yet!"
                    }
                    return jsonify(body),400
                else:
                    hashData = dbData[3]
                    hashData = str(hashData)
                    hashBuild = []
                    for index,char in enumerate(hashData):
                            if index == 0 or index == 1 or index == (len(hashData) - 1):
                                    continue
                            else:
                                    hashBuild.append(char)
                    rComHash = "".join(hashBuild)

                    body = {
                        "hash": rComHash #Fourth Column is Hash
                    }
                    return jsonify(body),200

            return jsonify(body),200
        except Exception as e:
            print(str(e))
    

@app.route('/getrcom',methods = ["POST"])
@cross_origin()
def getrcom():
    if request.method == "OPTIONS":
        return build_preflight_response()

    elif request.method == "POST":
        try:
            jsonData = request.json
            address = jsonData["address"]
            connection = sqlite3.connect(r"./blackjack.db")
            cursor = connection.cursor()
            cursor.execute("SELECT * FROM GAMEDATA WHERE [ADR] = ?",(address,))

            gameState = getGameState(address)

            if gameState != 5 or gameState !=6:
                body = {
                    "Message": "You are not allowed to receive the casino's private key yet!"
                }
                return jsonify(body),400
            else:
                dbData = cursor.fetchone()

                if dbData is None:
                    body = {
                        "Message": "You never started a game."
                    }
                    return jsonify(body),400
                else:
                    body = {
                        "rcom": db[1] #Fourth Column is Hash
                    }
                    return jsonify(body),200

            return jsonify(body),200
        except Exception as e:
            print(str(e))





if __name__ == '__main__':
    app.run(host = '0.0.0.0', port = 5000, debug = True)