'use client'
import Script from "next/script";
import { useEffect, useState } from "react";
import { Map, MapMarker } from "react-kakao-maps-sdk";
import './map.css'

// npm install react-kakao-maps-sdk
const KAKAO_SDK_URL = `//dapi.kakao.com/v2/maps/sdk.js?appkey=2832c4ac7b4b2d80ad011eb167dee282&libraries=services,clusterer&autoload=false`;
const KAKAO_API_KEY = '2832c4ac7b4b2d80ad011eb167dee282'

export default function KakaoMap() {
  const [position, setPosition] = useState({
    // 초기 위치 설정: 인천 부평
    lat: 37.50802,
    lng: 126.72185
  });

  const {kakao} = window;
  const [loaded, setLoaded] = useState(false);
  const [info, setInfo] = useState();
  const [markers, setMarkers] = useState([]);
  const [map, setMap] = useState();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(()=> {
    if(!map) return

    const ps = new kakao.maps.services.Places()

    ps.keywordSearch(searchTerm, (data, status, _pagination) =>  {
      if(status === kakao.maps.services.Status.OK) {
        const bounds = new kakao.maps.LatLngBounds()
        let markers = []

        for(var i=0; i<data.length; i++) {
          markers.push({
            position: {
              lat: data[i].y,
              lng: data[i].x,
            },
            content: data[i].place_name,
          })
          bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x))
        }
        setMarkers(markers)

        map.setBounds(bounds)
      }
    })
  }, [map, searchTerm])

  const moveToCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // 현재 위치를 가져와서 상태 업데이트
          setPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
  }

  useEffect(() => {
    const script = document.createElement('script');
    script.src = KAKAO_SDK_URL;
    document.head.appendChild(script);
    script.onload = () => setLoaded(true);
  }, []);


  return (
    <div>
      <div className="SearchBar">
        <form onSubmit={handleSearchSubmit}>
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="검색어를 입력하세요" className="Search-input"/>
          <button type="submit" className="Search-button">검색</button>
        </form>
        <button onClick={moveToCurrentLocation} className="my-current-location">	&#10146;</button>
      </div>

      <div className="map-container">
      <Script src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}&libraries=services,clusterer&autoload=false`} strategy="beforeInteractive" />
        {loaded && (
          <div className="map-wrapper">
            <Map center={position} className="map" level={3} draggable={true} onCreate={setMap}>
              {
                markers.map((marker)=>(
                  <MapMarker
                  key={`marker-${marker.content}-${marker.position.lat},${marker.position.lng}`}
                  position={marker.position}
                  onClick={() => setInfo(marker)}
                  >
                    {info && info.content === marker.content && (
                      <div style={{color:"#000"}}>{marker.content}</div>
                    )}
                  </MapMarker>
                ))
              }
            </Map>
          </div>
        )}
      </div>
    </div>
  );
}  
