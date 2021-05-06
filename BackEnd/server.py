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
w3 = Web3(Web3.HTTPProvider(config.web3Provider))
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
            rP1 = jsonData["rP1"]
            rP2 = jsonData["rP2"]
            connection = sqlite3.connect("blackjack.db")
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
                        "Message": "Your hashes aren't ready yet!"
                    }
                    return jsonify(body),400
                elif len(rP1) != 156 or len(rP2) != 156:
                    body = {
                        "Message": "You gave an incorrect rp. Please make sure both rp1 and rp2 are both 156 bits each."
                    }
                    return jsonify(body),400
                elif len(dbData[5]) != 0:
                    body = {
                        "Message": "You have already sent us your rp."
                    }
                    return jsonify(body),400
                else:
                    dbData = list(dbData)
                    dbData[5] = rP1
                    dbData[6] = rP2
                    cursor.execute("DELETE FROM GAMEDATA WHERE [ADR] = ?",(address,))
                    connection.commit()
                    cursor.execute("INSERT INTO GAMEDATA VALUES(?,?,?,?,?,?,?)", tuple(dbData))
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
            connection = sqlite3.connect("blackjack.db")
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
                    rComHash1 = dbData[3]
                    rComHash2 = dbData[4]
                    rComHash1 = str(rComHash1)
                    rComHash2 = str(rComHash2)
                    hashBuild = []
                    for index,char in enumerate(rComHash1):
                            if index == 0 or index == 1 or index == (len(rComHash1) - 1):
                                    continue
                            else:
                                    hashBuild.append(char)
                    rComHash1 = "".join(hashBuild)
                    hashBuild = []
                    for index,char in enumerate(rComHash2):
                            if index == 0 or index == 1 or index == (len(rComHash2) - 1):
                                    continue
                            else:
                                    hashBuild.append(char)
                    rComHash2 = "".join(hashBuild)

                    body = {
                        "rComHash1": rComHash1, #Fourth Column is Hash
                        "rComHash2": rComHash2 #Fourth Column is Hash
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
            connection = sqlite3.connect("blackjack.db")
            cursor = connection.cursor()
            cursor.execute("SELECT * FROM GAMEDATA WHERE [ADR] = ?",(address,))

            gameState = getGameState(address)
            print(gameState)

            if gameState != 5:
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
                        "rCom1": dbData[1],
                        "rCom2": dbData[2]
                    }
                    return jsonify(body),200

            return jsonify(body),200
        except Exception as e:
            print(str(e))





if __name__ == '__main__':
    app.run(host = '0.0.0.0', port = 5000, debug = True)
