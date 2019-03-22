import L from "leaflet";
import React from "react";
import turf from "turf";
import dissolve from "@turf/dissolve";
import {
  Map,
  Pane,
  ZoomControl,
  ScaleControl,
  LayerGroup,
  TileLayer,
  WMSTileLayer,
  GeoJSON
} from "react-leaflet";

import Base from "../base";

import Actions from "../enums/actions";
import Styles from "../enums/styles";
import MapTopics from "../enums/maptopics";
import MapBaseLayers from "../enums/mapbaselayers.js";
import MapOverlays from "../enums/mapoverlays.js";
import MapStyles from "../enums/mapstyles.js";
import "leaflet-semicircle";
import "leaflet-segment-charts";
import "leaflet-regular-grid-cluster";

export default class MapContainer extends React.Component {
  componentDidMount() {
    this.lEl = this.refs.map.leafletElement;
    this.lastTopic = appState.activeMapTopic;
    window["map"] = this.lEl;
    L.Util.setOptions(map, { maxBoundsViscosity: 1 });

    this.dataLayers = [];

    this.afterRender();
    if (data.isis_temples) {
      this.topicChanged();
    }
  }

  componentDidUpdate() {
    this.afterRender();
  }

  afterRender() {
    if (this.lastTopic != appState.activeMapTopic) {
      this.lastTopic = appState.activeMapTopic;
      this.topicChanged();
    }
    if (window["newwRefreshMap"]) {
      this.topicChanged();
      window["newwRefreshMap"] = false;
    }
  }

  topicChanged() {
    this.visualiseTopic();
  }

  refreshMapTiles() {
    let that = this;

    Object.keys(appState.MapBaseLayers).map(mapTileKey => {
      let mapTile = that.props.appState.MapBaseLayers[mapTileKey];
      if (mapTile.active) {
        mapTile.layer.addTo(that.map);
      } else {
        mapTile.layer.remove();
      }
    });
  }

  refresh() {
    this.map.setView(
      Base.getActiveMapTopic().originLatLng,
      Base.getActiveMapTopic().originZoom
    );

    this.refreshMapTiles();
  }

  moveEndHandle() {
    var centerLL = this.lEl.getCenter();
    //dispatcher.dispatch(Actions['MAP_CHANGE_CENTER'], {newMapCenter: centerLL})
  }

  zoomEndHandle() {
    var zoom = this.lEl.getZoom();
    dispatcher.dispatch(Actions["MAP_CHANGE_ZOOM"], { newMapZoom: zoom });
  }

  renderBaseLayers() {
    const activeBaseLayerId = Object.keys(MapBaseLayers).find(
      (mapTileKey, mapIndex) => {
        const mapTile = MapBaseLayers[mapTileKey];
        return mapTile.id === appState.activeBaseLayer;
      }
    );

    const activeBaseLayer = MapBaseLayers[activeBaseLayerId];
    return (
      <TileLayer
        key={activeBaseLayerId}
        url={activeBaseLayer.url}
        zIndex={1}
        opacity={activeBaseLayer.opacity}
        className={activeBaseLayer.className}
        attribution={activeBaseLayer.attribution}
      />
    );
  }

  renderOverlays() {
    let overlayLayers = [];

    Object.keys(MapOverlays).map(function(mapOverlayKey, mapIndex) {
      let mapOverlay = MapOverlays[mapOverlayKey];

      if (appState.activeOverlays.indexOf(mapOverlay.id) != -1) {
        if (mapOverlay.type === "wms") {
          overlayLayers.push(
            <WMSTileLayer
              url={mapOverlay.url}
              key={mapIndex}
              layers={mapOverlay.layers}
              format={mapOverlay.format}
              opacity={mapOverlay.opacity}
              transparent={mapOverlay.transparent}
              attribution={mapOverlay.attribution}
              zIndex={2}
            />
          );
        }
        if (mapOverlay.type === "geojson") {
          overlayLayers.push(
            <GeoJSON
              attribution={mapOverlay.attribution}
              data={mapOverlay.json.ne_50m}
              key={mapIndex}
              interactive={false}
              style={{
                fill: false,
                weight: 1,
                color: "black"
              }}
            />
          );
        }
      }
    });

    return overlayLayers;
  }

  render() {
    var that = this;

    this.emptyCells = {
      weight: 0.2,
      fillColor: "none",
      color: "black"
    };

    return (
      <div className="map-wrapper" style={Styles["MAP_WRAPPER"]()}>
        <Map
          ref="map"
          minZoom={4}
          maxBounds={[[0, -30], [70, 90]]}
          maxZoom={8}
          center={appState.mapCenter}
          style={Styles["MAP"]()}
          zoom={appState.mapZoom}
          onMoveEnd={this.moveEndHandle.bind(this)}
          onZoomEnd={this.zoomEndHandle.bind(this)}
        >
          <ScaleControl imperial={false} />
          {this.renderBaseLayers()}
          <Pane name="overlays">{this.renderOverlays()}</Pane>
        </Map>
      </div>
    );
  }

  drawLayers() {
    this.dataLayers.map(layer => layer.addTo(map));
  }

  clearDataLayer() {
    this.dataLayers.map(layer => {
      if (layer.unregister) {
        try {
          layer.unregister();
        } catch (e) {
          console.log(e);
        }
      }
      layer.clearLayers();

      map.removeLayer(layer);
    });
    this.dataLayers = [];
  }

  visualiseTopic() {
    const topic = appState.activeMapTopic;
    this.clearDataLayer();

    const t1 = Base.now();

    switch (topic) {
      case MapTopics["ISIS"].label:
        this.visualiseIsis();
        break;

      case MapTopics["CHRISTROME"].label:
        this.visualiseChristrome();
        break;

      case MapTopics["MITHORIG"].label:
        this.visualiseMithorig();
        break;
    }

    this.drawLayers();

    // time
    console.log("");
    console.log("topic", topic, "drawn after", Base.now() - t1, "ms");
    console.log("");
  }

  /*
      ISIS TOPIC
    */
  visualiseIsis() {
    const options = Object.assign(appState.controlOptions.isis, {});
    const isisOptions = {
      circleSegmentAngle: 40,
      colors: MapStyles.isis.deitiesColors,
      propertyName: "deities",
      opacityDecrease: 0.2,
      maxOpacity: 0.3
    };

    // temples
    const templeOptions = Object.assign(isisOptions, {
      maxDist: options.templeDistance,
      noSteps: parseInt(options.templeDistance / options.circleStep) + 1
    });
    const temples = L.segmentMarkerGroup(templeOptions);
    const templesJson = L.geoJSON(data.isis_temples);
    const templeLayers = templesJson.getLayers();

    temples.addLayers(templeLayers);

    // artefacts
    const artefactsOptions = Object.assign(isisOptions, {
      maxDist: options.artefactDistance,
      noSteps: parseInt(options.artefactDistance / options.circleStep) + 1
    });
    const artefacts = L.segmentMarkerGroup(artefactsOptions);
    const artefactsJson = L.geoJSON(data.isis_artefacts);
    const artefactLayers = artefactsJson.getLayers();

    artefacts.addLayers(artefactLayers);

    this.dataLayers.push(artefacts);
    this.dataLayers.push(temples);

    const uniqueIsis = [];
    data.isis_artefacts.features
      .filter(
        artefact => artefact.geometry && artefact.properties.deities.length
      )
      .map(artefact => {
        const isThere = uniqueIsis.find(
          point => point.cs[0] === artefact.geometry.coordinates[0]
        );
        const item = {
          type: "artefact",
          label: artefact.properties.label,
          deities: artefact.properties.deities
        };
        isThere
          ? isThere.items.push(item)
          : uniqueIsis.push({
              items: [item],
              cs: artefact.geometry.coordinates
            });
      });

    data.isis_temples.features
      .filter(temple => temple.geometry && temple.properties.deities.length)
      .map(temple => {
        const isThere = uniqueIsis.find(
          point => point.cs[0] === temple.geometry.coordinates[0]
        );
        const item = {
          type: "temple",
          label: temple.properties.label,
          deities: temple.properties.deities
        };
        isThere
          ? isThere.items.push(item)
          : uniqueIsis.push({ items: [item], cs: temple.geometry.coordinates });
      });

    const isisSigns = uniqueIsis.map(point => {
      return L.circleMarker([point.cs[1], point.cs[0]], {
        radius: 1,
        className: "map-isis"
      }).bindTooltip(
        point.items
          .map(item => {
            return (
              item.type +
              " <b>" +
              item.label +
              "</b>" +
              " (deities: " +
              item.deities.join() +
              ")"
            );
          })
          .join("<br/ >")
      );
    });

    // aux circles
    const isisAuxSigns = uniqueIsis
      .filter(i => i.items.length > 1)
      .map(i =>
        L.circleMarker([i.cs[1], i.cs[0]], { radius: 3, className: "map-aux" })
      );
    this.dataLayers.push(L.featureGroup(isisAuxSigns));
    this.dataLayers.push(L.featureGroup(isisSigns));
  }

  /* 
      CHRISTROME TOPIC
    */
  visualiseChristrome() {
    const churchesGroups = [
      {
        id: 3,
        time: [313],
        items: [],
        color: MapStyles.christrome.colors[3]
      },
      {
        id: 2,
        time: [350],
        items: [],
        color: MapStyles.christrome.colors[2]
      },
      {
        id: 1,
        time: [800],
        items: [],
        color: MapStyles.christrome.colors[1]
      },
      {
        id: 0,
        time: [],
        items: [],
        color: MapStyles.christrome.colors[0]
      }
    ];

    const regions = Object.assign({}, data.regions);
    data.churches.features.map(church => {
      const date = church.properties.date;
      church.properties.time = 0;
      if (date) {
        churchesGroups
          .filter(g => g.id !== 0)
          .map(group => {
            if (group.time > date) {
              church.properties.time = Math.max(
                ...[church.properties.time, group.id]
              );
              church.geometry ? group.items.push(church) : null;
            }
          });
      }
    });

    // buffering groups
    churchesGroups
      .filter(g => g.id !== 0)
      .map(group => {
        const fc = turf.featureCollection(group.items);

        group.buffer = turf.simplify(
          dissolve(
            turf.buffer(
              fc,
              appState.controlOptions.christrome.churchRadius,
              "kilometers"
            )
          ),
          0.05
        );
        group.buffer.features.map(
          buffer => (buffer.bounds = L.geoJSON(buffer).getBounds())
        );
      });

    // drawing regions
    if (appState.controlOptions.christrome.mode === "regions") {
      regions.features.map(region => {
        region.properties.time = 0;
        const regionBbox = L.geoJSON(region).getBounds();

        churchesGroups
          .filter(g => g.id !== 0)
          .map(group => {
            const intersects = group.buffer.features.find(buffer => {
              return (
                buffer.bounds.intersects(regionBbox) &&
                !!turf.intersect(buffer, region)
              );
            });
            if (intersects) {
              region.properties.time = Math.max(
                ...[region.properties.time, group.id]
              );
            }
          });
      });

      this.dataLayers.push(
        L.geoJSON(regions, {
          style: region => {
            const color = churchesGroups.find(
              g => g.id === region.properties.time
            ).color;
            return MapStyles.christrome.region(color);
          }
        }).bindPopup(
          l =>
            "<div><span>region: <span><b>" +
            l.feature.properties.n +
            "<b></div>"
        )
      );
    }

    // drawing radii
    if (appState.controlOptions.christrome.mode === "radii") {
      churchesGroups
        .filter(g => g.id !== 0)
        .reverse()
        .map(group => {
          this.dataLayers.push(
            L.geoJSON(group.buffer, MapStyles.christrome.buffer(group))
          );
        });
    }

    // drawing churches
    const uniqueChurches = [];

    data.churches.features
      .filter(ch => ch.geometry && ch.properties.date)
      .map(church => {
        const cs = church.geometry.coordinates;
        const isThere = uniqueChurches.find(uch => uch.cs[0] === cs[0]);
        isThere
          ? isThere.items.push(church.properties)
          : uniqueChurches.push({ cs: cs, items: [church.properties] });
      });

    const churchesSigns = uniqueChurches.map(church => {
      const radius = 1.2 + church.items.length * 0.1;
      return L.circleMarker([church.cs[1], church.cs[0]], {
        radius: radius,
        className: "map-churches"
      }).bindTooltip(
        church.items
          .map(item => "church <b>" + item.n + "</b> (" + item.date + ")")
          .join("<br/ >")
      );
    });

    // draw auxiliary
    const churchesAuxSigns = uniqueChurches
      .filter(ch => ch.items.length > 1)
      .map(ch =>
        L.circleMarker([ch.cs[1], ch.cs[0]], {
          radius: 3 + ch.items.length * 0.1,
          attribution: "ORBIS <http://orbis.stanford.edu/>",
          className: "map-aux"
        })
      );

    this.dataLayers.push(L.featureGroup(churchesAuxSigns));
    this.dataLayers.push(L.featureGroup(churchesSigns));
  }

  /* 
      MITHORIG TOPIC
    */
  visualiseMithorig() {
    const mithraicColors = MapStyles.mithorig.mithraicColors;
    // forts
    const fortRules = {
      cells: {
        fillColor: {
          method: "count",
          attribute: "",
          scale: "quantile",
          range: MapStyles.mithorig.fortColors
        },
        fillOpacity: MapStyles.mithorig.fortOpacity,
        weight: 0.5
      }
    };

    const mithreaRules = {
      markers: {
        radius: {
          method: "count",
          attribute: "",
          scale: "continuous",
          range: [3, 8],
          domain: [0, 15]
        },
        color: "black",
        weight: 1,
        fillOpacity: MapStyles.mithorig.placeOpacity,
        fillColor: {
          method: "mean",
          attribute: "p",
          scale: "size",
          domain: [0, 1],
          range: mithraicColors
        }
      }
    };

    const gridOptions = {
      gridMode: "hexagon",
      showTexts: false,
      emptyCellOptions: this.emptyCells,
      showMarkers: false,
      showCells: false,
      showEmptyCells: true,
      zoomShowElements: 7,
      gridOrigin: { lat: 25, lng: -5 },
      gridEnd: { lat: 55, lng: 45 },
      zoomHideGrid: 7,
      zoneSize: appState.controlOptions.mithorig.gridSize
    };

    const fortGrid = L.regularGridCluster(
      Object.assign(gridOptions, { showCells: true, rules: fortRules })
    );

    // drawing forts
    const uniqueForts = [];
    const fortDistanceThreshold = 10000;

    data.forts.features
      .filter(f => f.geometry)
      .map(fort => {
        const cs = L.latLng(
          fort.geometry.coordinates[1],
          fort.geometry.coordinates[0]
        );
        const isThere = uniqueForts.find(
          uf => uf.cs.distanceTo(cs) < fortDistanceThreshold
        );
        isThere
          ? isThere.items.push(fort.properties)
          : uniqueForts.push({ cs: cs, items: [fort.properties] });
      });

    const fortPoints = uniqueForts.map(fort => {
      return {
        marker: L.circleMarker(fort.cs, {
          radius: fort.items.length > 1 ? 5 : 3,
          className: "map-forts"
        }).bindTooltip(
          fort.items.map(item => "fort <b>" + item.n + "</b>").join("<br/ >")
        ),
        properties: {}
      };
    });

    fortGrid.addLayers(fortPoints);
    this.dataLayers.push(fortGrid);

    // mithrea
    const mithraeaGrid = L.regularGridCluster(
      Object.assign(gridOptions, { showMarkers: true, rules: mithreaRules })
    );

    const weightProbability = probabilities => {
      const weights = probabilities.map(pr => {
        if (pr === "definitive") return 1;
        else if (pr === "probable") return 0.5;
        else if (pr === "dubious") return 0;
        else return 0;
      });

      return Base.average(weights);
    };
    const colorProbability = probabilities => {
      const avgWeight = weightProbability(probabilities);
      if (avgWeight > 0.66) return mithraicColors[2];
      else if (avgWeight > 0.33) return mithraicColors[1];
      else return mithraicColors[0];
    };

    // drawing mithraea
    const uniqueMithraea = [];
    const mithraeaDistanceThreshold = 10000;

    data.mithraea.features
      .filter(m => m.geometry)
      .filter(m => appState.controlOptions.mithorig[m.properties.c])
      .map(mith => {
        const cs = L.latLng(
          mith.geometry.coordinates[1],
          mith.geometry.coordinates[0]
        );
        const isThere = uniqueMithraea.find(
          uf => uf.cs.distanceTo(cs) < mithraeaDistanceThreshold
        );
        isThere
          ? isThere.items.push(mith.properties)
          : uniqueMithraea.push({ cs: cs, items: [mith.properties] });
      });

    const mithraeaPoints = uniqueMithraea.map(mith => {
      return {
        marker: L.circleMarker(mith.cs, {
          radius: 3 + mith.items.length * 0.3,
          className: "map-mithraea",
          fillColor: colorProbability(mith.items.map(i => i.c))
        }).bindTooltip(
          mith.items
            .map(i => "mithraeum <b>" + i.n + "</b> (" + i.c + ")")
            .join("<br/ >")
        ),
        properties: { p: weightProbability(mith.items.map(i => i.c)) }
      };
    });

    mithraeaGrid.addLayers(mithraeaPoints);
    this.dataLayers.push(mithraeaGrid);
    this.dataLayers.push(mithraeaGrid);
  }
}
