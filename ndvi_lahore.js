// Lahore SHP
var geometry = ee.FeatureCollection('projects/banded-equinox-420006/assets/Lahore_city');

// Date Range
var START = ee.Date('2023-01-01');
var END   = ee.Date('2023-12-31');

// Sentinel-2 Harmonized Imagery
var S2 = ee.ImageCollection('COPERNICUS/S2_HARMONIZED')
  .filterDate(START, END)
  .filterBounds(geometry)
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10));

print('Filtered Sentinel-2 Collection:', S2);

// Cloud Mask Function
function maskS2clouds(image) {
  var QA60 = image.select('QA60');
  var cloudBitMask = (1 << 10);
  var cirrusBitMask = (1 << 11);
  var mask = QA60.bitwiseAnd(cloudBitMask).eq(0)
                .and(QA60.bitwiseAnd(cirrusBitMask).eq(0));

  return image.updateMask(mask)
              .divide(10000)
              .copyProperties(image, image.propertyNames());
}

// Apply cloud mask
var S2_masked = S2.map(maskS2clouds);

// NDVI Band
var addNDVI = function(image) {
  var ndvi = image.normalizedDifference(['B8', 'B4']).rename('nd');
  return image.addBands(ndvi);
};

var S2_with_NDVI = S2_masked.map(addNDVI);

// Median NDVI
var NDVI = S2_with_NDVI.select(['nd']);
var NDVImed = NDVI.median();

// NDVI Palette
var ndvi_pal = [
  'FFFFFF', 'CE7E45', 'DF923D', 'F1B555', 'FCD163',
  '99B718', '74A901', '66A000', '529400', '3E8601',
  '207401', '056201', '004C00', '023B01', '012E01',
  '011D01', '011301'
];

// Compute number of months
var monthsCount = END.difference(START, 'month').add(1).toInt();
print('Number of months:', monthsCount);

// Create a sequence [0, 1, 2, ..., monthsCount-1]
var monthSequence = ee.List.sequence(0, monthsCount.subtract(1));

// FeatureCollection with monthly mean NDVI values
var monthlyFeatures = ee.FeatureCollection(monthSequence.map(function(n) {
  n = ee.Number(n);
  var periodStart = START.advance(n, 'month');
  var periodEnd = periodStart.advance(1, 'month');

// Mean NDVI image for the month
var monthlyImage = S2_with_NDVI
  .filterDate(periodStart, periodEnd)
  .select('nd')
  .mean()
  .set('system:time_start', periodStart.millis())
  .set('month_start', periodStart.format('YYYY-MM-dd'));

// Reduce to single mean NDVI over the region.
var meanDict = monthlyImage.reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: geometry,
  scale: 1000,
  bestEffort: true,
  maxPixels: 1e13
});

var meanNdvi = ee.Number(meanDict.get('nd'));

// Month label and NDVI value
var feat = ee.Feature(null, {
  'month': periodStart.format('YYYY-MM'),
  'ndvi': meanNdvi
});
  return feat;
}));

print('Monthly FeatureCollection (one feature per month):', monthlyFeatures.limit(24));

// Chart
var chart = ui.Chart.feature.byFeature(monthlyFeatures, 'month', 'ndvi')
  .setChartType('LineChart')
  .setOptions({
    title: 'Mean Monthly NDVI of Lahore',
    hAxis: {title: 'Month'},
    vAxis: {title: 'NDVI', viewWindow: {min: 0, max: 1}},
    lineWidth: 2,
    pointSize: 6
});

print(chart);

// Map display
Map.centerObject(geometry, 10);
Map.addLayer(
  NDVImed.clip(geometry),
  {min: 0, max: 1, palette: ndvi_pal},
  'Median NDVI'
);

// Export Raster
Export.image.toDrive({
  image: NDVImed.clip(geometry),
  description: 'Lahore_NDVI_S2',
  region: geometry,
  scale: 10,
  crs: 'EPSG:4326',
  maxPixels: 1e13
});