from flask import Flask
from flask import render_template
from server.DataLoader import DataLoader
import json

app = Flask(__name__)

app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['TEMPLATES_AUTO_RELOAD'] = True


data_loader = DataLoader()

@app.route("/")
def index():
    """
    return index.html with transformed and scaled data.
    """
    return render_template("index.html", elevation=data_loader.get_elevation(), temp=data_loader.get_temperature(), heart_rate= data_loader.get_heart_rate())
