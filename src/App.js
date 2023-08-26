import React, {useEffect, useState} from 'react';
import Switch from 'react-switch';
import axios from "axios";

const HOST = "172.20.10.2"

const ws = new WebSocket(`ws://${HOST}/ws`);

const App = () => {
  const [isFetch, setFetch] = useState(true);

  const [isOnline, setIsOnline] = useState(false);
  const [temperature, setTemperature] = useState(0);
  const [humidity, setHumidity] = useState(0);
  const [airQuality, setAirQuality] = useState(0);
  const [isFanAuto, setIsFanAuto] = useState(true);
  const [isFanOn, setIsFanOn] = useState(false);

  useEffect(() => {
    (async () => {
      const onlineResult = await axios.post(`http://${HOST}/api/online`)
      setIsOnline(onlineResult.data)

      setFetch(false)
    })()
  }, [])

  ws.onopen = (e) => {
    ws.send("to_arduino:request");
  }

  ws.onmessage = (e) => {
    const [key, value] = e.data.split(':')

    console.log(key+" : "+value)

    if (key === 'arduino open') {
      setIsOnline(true)
    } else if (key === 'arduino close') {
      setIsOnline(false)
    } else {
      if (key === 'temperature') {
        setTemperature(value)
      } else if (key === 'humidity') {
        setHumidity(value)
      } else if (key === 'air_quality') {
        setAirQuality(value)
      }
    }

    console.log(key+' : '+value)
  };

  const handleFanAutoToggle = () => {
    setIsFanAuto(prevState => !prevState);

    if (!isFanAuto) {
      setIsFanOn(false)
    }

    ws.send(`to_arduino:auto_${!isFanAuto ? 'on' : 'off'}`)
  };

  const handleFanToggle = () => {
    setIsFanOn(prevState => !prevState);

    ws.send(`to_arduino:fan_${!isFanOn ? 'on' : 'off'}`)
  };

  if (isFetch) return <></>

  return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-semibold mb-4">공기청정기</h1>

          <p className="mb-5">
            상태: <span className={isOnline ? 'text-green-500' : 'text-red-500'}>{isOnline ? '켜짐' : '꺼짐'}</span>
          </p>

          {isOnline ? (
              <>
                <p className="mb-1">온도: {temperature}°C</p>
                <p className="mb-1">습도: {humidity}%</p>
                <p className="mb-5" style={{ color: airQuality <= 50 ? 'green' : airQuality <= 80 ? 'orange' : 'red' }}>
                  대기질: {airQuality <= 50 ? '좋음' : airQuality <= 80 ? '보통' : '나쁨'}
                </p>

                <div className="flex items-center mb-1">
                  <span className="mr-2">팬 자동설정:</span>
                  <Switch
                      onChange={handleFanAutoToggle}
                      checked={isFanAuto}
                      onColor="#48BB78"
                      offColor="#D1D5DB"
                      handleDiameter={24}
                      uncheckedIcon={false}
                      checkedIcon={false}
                  />
                </div>

                {!isFanAuto && (
                    <div className="flex items-center mb-2">
                      <span className="mr-2">팬 켜짐:</span>
                      <Switch
                          onChange={handleFanToggle}
                          checked={isFanOn}
                          onColor="#48BB78"
                          offColor="#D1D5DB"
                          handleDiameter={24}
                          uncheckedIcon={false}
                          checkedIcon={false}
                      />
                    </div>
                )}
              </>
          ) : (
              <p className="text-red-500 mt-4">공기청정기가 꺼져있습니다.</p>
          )}
        </div>
      </div>
  );
};

export default App;
