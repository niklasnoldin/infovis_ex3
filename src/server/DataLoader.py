import json
import gpxpy
from datetime import datetime

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
        self.extract_data()

    @staticmethod
    def extract_point_features(lon_lat, date):
        """
        This function fills the static geoJson format with coordinates and dates (both as list, as we gather multiple points to a lineString)
        """
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
        """
       This function fills the static geoJson format with a list of features
       """
        geo_json = json.loads("""{
            "type": "FeatureCollection",
            "features": []
        }""")
        geo_json["features"] = feature_list
        return geo_json

    @staticmethod
    def get_extensions_data_safe(point, index):
        """
        Helper function to handle single missing data points.
        """
        try:
            return point.extensions[0][index].text
        except IndexError:
            return None


    def extract_data(self):
        """
        Extracting all the data from the gpx file. We aggregate the lists for heart_rate, temperature and elevation as well as the geoJson coordinates.
        The variable AGGREGATE_TO specifiers how many points we should gather in one LineString. More points in one Linestring improves the performance but makes it less exact. (min. is 2)
        """
        AGGREGATE_TO = 16
        self.location_info = []
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
                    if len(temp_dates) == AGGREGATE_TO:
                        json_pts.append(self.extract_point_features(temp_pts, temp_dates))
                        temp_dates = [date]
                        temp_pts = [[point.longitude, point.latitude]]
                    self.location_info.append({date: [point.longitude, point.latitude]})
                    self.elevation_info.append({date: point.elevation})
                    self.heart_rate_info.append({date: self.get_extensions_data_safe(point, 1)})
                    self.temp_info.append({date: self.get_extensions_data_safe(point, 0)})
        self.geo_json = self.create_geojson(json_pts)

    # The following functions convert the extracted elements to string. That's necessary for passing them over the rest endpoint.
    def get_elevation(self):
        return json.dumps(self.elevation_info)

    def get_location(self):
        return json.dumps(self.location_info)

    def get_heart_rate(self):
        return json.dumps(self.heart_rate_info)

    def get_temperature(self):
        return json.dumps(self.temp_info)


    def get_geo_json(self):
        # return self.geo_json
        return json.dumps(self.geo_json)

