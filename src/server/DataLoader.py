import pandas as pd
from .pca_transformer import PcaPipeline
import json
import gpxpy
from datetime import datetime
import xml.etree.ElementTree as ET

datetime.strptime('Thu, 16 Dec 2010 12:14:05', '%a, %d %b %Y %H:%M:%S')

class DataLoader:
    def __init__(self):
        """
        Load data from .gpx file in memory.
        """
        with open('src/static/data/activity_8497576084.gpx', 'r') as gpx_file:
            self.gpx = gpxpy.parse(gpx_file)
        self.extract_data()

    @staticmethod
    def get_extensions_data_safe(point, index):
        """
        Helper function to handle single missing data points.
        :param point:
        :param index:
        :return:
        """
        try:
            return point.extensions[0][index].text
        except IndexError:
            return None


    def extract_data(self):
        self.elevation_info = []
        self.heart_rate_info = []
        self.temp_info = []
        for track in self.gpx.tracks:
            for segment in track.segments:
                for point in segment.points:
                    # print(str(point.extensions[0][1].text))
                    # print(str(point.extensions[0][0].text))
                    self.elevation_info.append({point.time.isoformat(): point.elevation})
                    self.heart_rate_info.append({point.time.isoformat(): self.get_extensions_data_safe(point, 1)})
                    self.temp_info.append({point.time.isoformat(): self.get_extensions_data_safe(point, 0)})

    def get_elevation(self):
        return json.dumps(self.elevation_info)

    def get_heart_rate(self):
        return json.dumps(self.heart_rate_info)

    def get_temperature(self):
        return json.dumps(self.temp_info)
