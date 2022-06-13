import pandas as pd
from .pca_transformer import PcaPipeline
import json
import gpxpy
from datetime import datetime
datetime.strptime('Thu, 16 Dec 2010 12:14:05', '%a, %d %b %Y %H:%M:%S')

class DataLoader:
    def __init__(self):
        """
        Load data from .gpx file in memory.
        """
        with open('src/static/data/Venter_Skirunde_.gpx', 'r') as gpx_file:
            self.gpx = gpxpy.parse(gpx_file)

    def get_gpx_data(self):
        self.gpx.to_xml()

    def get_elevation(self):
        route_info = []
        for track in self.gpx.tracks:
            for segment in track.segments:
                for point in segment.points:
                    p = dict()
                    p[point.time.isoformat()] = point.elevation
                    route_info.append(p)
        return json.dumps(route_info)
