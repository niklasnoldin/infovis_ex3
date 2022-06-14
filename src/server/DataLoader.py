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
        self.geo_json = None
        with open('src/static/data/activity_8497576084.gpx', 'r') as gpx_file:
            self.gpx = gpxpy.parse(gpx_file)
        # f = open('src/static/data/venter.geojson')
        # self.geo_json = json.load(f)
        # with open('src/static/data/venter.geojson', 'r') as file:
        #     self.geo_json = file.read()
        #     print(for file.readlines())
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
        json_pts = []
        for track in self.gpx.tracks:
            for segment in track.segments:
                temp_dates = []
                temp_pts = []
                for point in segment.points:
                    # print(str(point.extensions[0][1].text))
                    # print(str(point.extensions[0][0].text))
                    date = point.time.isoformat()

                    temp_pts.append([point.longitude, point.latitude])
                    temp_dates.append(date)
                    if len(temp_dates) == 2:
                        json_pts.append(self.extract_point_features(temp_pts, temp_dates))
                        temp_dates = [date]
                        temp_pts = [[point.longitude, point.latitude]]
                    self.elevation_info.append({date: point.elevation})
                    self.heart_rate_info.append({date: self.get_extensions_data_safe(point, 1)})
                    self.temp_info.append({date: self.get_extensions_data_safe(point, 0)})
        self.geo_json = self.create_geojson(json_pts)

    def get_elevation(self):
        return json.dumps(self.elevation_info)

    def get_heart_rate(self):
        return json.dumps(self.heart_rate_info)

    def get_temperature(self):
        return json.dumps(self.temp_info)

    def get_geo_json(self):
        # return self.geo_json
        return json.dumps(self.geo_json)

    @staticmethod
    def extract_point_features(lon_lat, date):
        default_pt = json.loads("""
            {
      "type": "Feature",
      "geometry": {
        "type": "LineString",
        "coordinates": []
      },
      "properties": {
        "time": "value0"
      }
    }
        """)
        default_pt["geometry"]["coordinates"] = lon_lat
        default_pt["properties"]["time"] = date
        return default_pt

    @staticmethod
    def create_geojson(feature_list):
        geo_json = json.loads("""{
            "type": "FeatureCollection",
            "features": []
        }""")
        geo_json["features"] = feature_list
        return geo_json