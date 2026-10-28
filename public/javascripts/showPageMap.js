maptilersdk.config.apiKey = maptilerApiKey;
maptilersdk.config.primaryLanguage = maptilersdk.Language.JAPANESE;

const map = new maptilersdk.Map({
    container: 'map',
    style: maptilersdk.MapStyle.BRIGHT,
    center: campground.geometry.coordinates,
    zoom: 10,
});

const marker = new maptilersdk.Marker()
    .setLngLat(campground.geometry.coordinates)
    .addTo(map);

const popup = new maptilersdk.Popup({ offset: 25 })
    .setHTML(
        `<p>${campground.title}</p><p>${campground.location}</p>`
    );

// マーカーのDOM要素を取得
const markerElement = marker.getElement();

// ホバーしたときに表示
markerElement.addEventListener('mouseenter', () => {
    popup.setLngLat(campground.geometry.coordinates).addTo(map);
});

// マーカーからカーソルが離れたときに非表示
markerElement.addEventListener('mouseleave', () => {
    popup.remove();
});