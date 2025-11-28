"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { MapPin, CheckCircle, XCircle, Loader } from "lucide-react"

interface AddressSuggestion {
  name: string
  coords: [number, number]
}

export default function AddressChecker() {
  const [address, setAddress] = useState("")
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [selectedAddress, setSelectedAddress] = useState<AddressSuggestion | null>(null)
  const [isInDeliveryZone, setIsInDeliveryZone] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [city, setCity] = useState("moscow")
  const [ymaps, setYmaps] = useState<any>(null)

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY

    if (!apiKey) {
      console.error("API key not set")
      return
    }

    // Check if script already exists
    if (window.ymaps) {
      window.ymaps.ready(() => {
        setYmaps(window.ymaps)
      })
      return
    }

    const script = document.createElement("script")
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`
    script.async = true
    script.onload = () => {
      window.ymaps.ready(() => {
        setYmaps(window.ymaps)
      })
    }
    document.body.appendChild(script)
  }, [])

  // МКАД coordinates for Moscow delivery zone
  const MKAD_COORDS: [number, number][] = [
    [55.774558, 37.842762],
    [55.76522, 37.842789],
    [55.755723, 37.842627],
    [55.747399, 37.841828],
    [55.739103, 37.841217],
    [55.730482, 37.840175],
    [55.721939, 37.83916],
    [55.712203, 37.837121],
    [55.703048, 37.83262],
    [55.694287, 37.829512],
    [55.68529, 37.831353],
    [55.675945, 37.834605],
    [55.667752, 37.837597],
    [55.658667, 37.839348],
    [55.650053, 37.833842],
    [55.643713, 37.824787],
    [55.637347, 37.814564],
    [55.62913, 37.802473],
    [55.623758, 37.794235],
    [55.617713, 37.781928],
    [55.611755, 37.771139],
    [55.604956, 37.758725],
    [55.599677, 37.747945],
    [55.594143, 37.734785],
    [55.589234, 37.723062],
    [55.583983, 37.709425],
    [55.578834, 37.696256],
    [55.574019, 37.683167],
    [55.571999, 37.668911],
    [55.573093, 37.647765],
    [55.573928, 37.633419],
    [55.574732, 37.616719],
    [55.575816, 37.60107],
    [55.5778, 37.586536],
    [55.581271, 37.571938],
    [55.585143, 37.555732],
    [55.587509, 37.545132],
    [55.5922, 37.526366],
    [55.594728, 37.516108],
    [55.60249, 37.502274],
    [55.609685, 37.49391],
    [55.617424, 37.484846],
    [55.625801, 37.474668],
    [55.630207, 37.469925],
    [55.641041, 37.456864],
    [55.648794, 37.448195],
    [55.654675, 37.441125],
    [55.660424, 37.434424],
    [55.670701, 37.42598],
    [55.67994, 37.418712],
    [55.686873, 37.414868],
    [55.695697, 37.407528],
    [55.702805, 37.397952],
    [55.709657, 37.388969],
    [55.718273, 37.383283],
    [55.728581, 37.378369],
    [55.735201, 37.374991],
    [55.744789, 37.370248],
    [55.75435, 37.369188],
    [55.762936, 37.369053],
    [55.771444, 37.369619],
    [55.779722, 37.369853],
    [55.789542, 37.372943],
    [55.79723, 37.379824],
    [55.805796, 37.386876],
    [55.814629, 37.390397],
    [55.823606, 37.393236],
    [55.83251, 37.395275],
    [55.840376, 37.394709],
    [55.850141, 37.393056],
    [55.858801, 37.397314],
    [55.867051, 37.405588],
    [55.872703, 37.416601],
    [55.877041, 37.429429],
    [55.881091, 37.443596],
    [55.882828, 37.459065],
    [55.884625, 37.473096],
    [55.888897, 37.48861],
    [55.894232, 37.5016],
    [55.899578, 37.513206],
    [55.90526, 37.527597],
    [55.907687, 37.543443],
    [55.909388, 37.559577],
    [55.910907, 37.575531],
    [55.909257, 37.590344],
    [55.905472, 37.604637],
    [55.901637, 37.619603],
    [55.898533, 37.635961],
    [55.896973, 37.647648],
    [55.895449, 37.667878],
    [55.894868, 37.681721],
    [55.893884, 37.698807],
    [55.889094, 37.712363],
    [55.883555, 37.723636],
    [55.877501, 37.735791],
    [55.874698, 37.741261],
    [55.862464, 37.764519],
    [55.861979, 37.765992],
    [55.850257, 37.788216],
    [55.850383, 37.788522],
    [55.844167, 37.800586],
    [55.832707, 37.822819],
    [55.828789, 37.829754],
    [55.821072, 37.837148],
    [55.811599, 37.838926],
    [55.802781, 37.840004],
    [55.793991, 37.840965],
    [55.785017, 37.841576],
    [55.774558, 37.842762],
  ]

  const isPointInPolygon = (point: [number, number], polygon: [number, number][]): boolean => {
    const [lat, lon] = point
    let inside = false

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [lati, loni] = polygon[i]
      const [latj, lonj] = polygon[j]

      const intersect = loni > lon !== lonj > lon && lat < ((latj - lati) * (lon - loni)) / (lonj - loni) + lati
      if (intersect) inside = !inside
    }

    return inside
  }

  const checkDeliveryZone = (coords: [number, number]): boolean => {
    if (city === "moscow") {
      return isPointInPolygon(coords, MKAD_COORDS)
    } else {
      const centerLat = 59.9343
      const centerLon = 30.3351
      const [lat, lon] = coords
      const latDiff = Math.abs(lat - centerLat)
      const lonDiff = Math.abs(lon - centerLon)
      const distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff)
      return distance < 0.17
    }
  }

  const fetchSuggestions = async (query: string) => {
    if (query.length < 3 || !ymaps) {
      setSuggestions([])
      return
    }

    setLoading(true)
    try {
      const cityName = city === "moscow" ? "Москва" : "Санкт-Петербург"
      const result = await ymaps.geocode(`${cityName}, ${query}`, { results: 5 })

      const geoObjects = result.geoObjects
      const suggestions: AddressSuggestion[] = []

      for (let i = 0; i < geoObjects.getLength(); i++) {
        const obj = geoObjects.get(i)
        suggestions.push({
          name: obj.getAddressLine(),
          coords: obj.geometry.getCoordinates(),
        })
      }

      setSuggestions(suggestions)
    } catch (err) {
      console.error("Error fetching suggestions:", err)
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAddress(value)
    setSelectedAddress(null)
    setIsInDeliveryZone(null)

    if (value.length >= 3) {
      setTimeout(() => {
        fetchSuggestions(value)
      }, 300)
    } else {
      setSuggestions([])
    }
  }

  const handleSelectAddress = (suggestion: AddressSuggestion) => {
    setSelectedAddress(suggestion)
    setAddress(suggestion.name)
    setSuggestions([])

    const inZone = checkDeliveryZone(suggestion.coords)
    setIsInDeliveryZone(inZone)
  }

  const handleCityChange = (newCity: string) => {
    setCity(newCity)
    setAddress("")
    setSuggestions([])
    setSelectedAddress(null)
    setIsInDeliveryZone(null)
  }

  const handleContinue = () => {
    if (isInDeliveryZone === true && selectedAddress) {
      const zoneName = city === "moscow" ? "МКАД" : "КАД"
      alert(`✅ Успех! Доставка по адресу: ${selectedAddress.name}`)
    }
  }

  const zoneName = city === "moscow" ? "МКАД" : "КАД"
  const cityNameRu = city === "moscow" ? "Москве" : "Санкт-Петербурге"

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-8 h-8 text-orange-500" />
            <h1 className="text-3xl font-bold text-gray-800">Проверка адреса доставки</h1>
          </div>

          <div className="flex gap-4 mb-6">
            <button
              onClick={() => handleCityChange("moscow")}
              className={`flex-1 py-3 rounded-lg font-semibold transition ${
                city === "moscow" ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Москва (МКАД)
            </button>
            <button
              onClick={() => handleCityChange("spb")}
              className={`flex-1 py-3 rounded-lg font-semibold transition ${
                city === "spb" ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Санкт-Петербург (КАД)
            </button>
          </div>

          <p className="text-gray-600 mb-6">
            Введите ваш адрес в {cityNameRu}. Мы доставляем только в пределах {zoneName}.
          </p>

          <div className="relative mb-4">
            <input
              type="text"
              value={address}
              onChange={handleAddressChange}
              placeholder="Начните вводить адрес..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg"
              disabled={!ymaps}
            />
            {loading && <Loader className="absolute right-3 top-3 w-6 h-6 text-orange-500 animate-spin" />}
          </div>

          {!ymaps && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              Загрузка API Яндекс.Карт...
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="mb-4 border-2 border-gray-200 rounded-lg overflow-hidden max-h-80 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => handleSelectAddress(suggestion)}
                  className="px-4 py-3 hover:bg-orange-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition"
                >
                  <p className="text-gray-800 font-medium">{suggestion.name}</p>
                </div>
              ))}
            </div>
          )}

          {selectedAddress && isInDeliveryZone !== null && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                isInDeliveryZone ? "bg-green-50 border-2 border-green-200" : "bg-red-50 border-2 border-red-200"
              }`}
            >
              {isInDeliveryZone ? (
                <>
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-800">Отлично! Мы доставляем по этому адресу</p>
                    <p className="text-sm text-green-600 mt-1">Адрес находится в пределах {zoneName}</p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6 text-red-600" />
                  <div>
                    <p className="font-semibold text-red-800">К сожалению, мы не доставляем по этому адресу</p>
                    <p className="text-sm text-red-600 mt-1">Адрес находится за пределами {zoneName}</p>
                  </div>
                </>
              )}
            </div>
          )}

          <button
            onClick={handleContinue}
            disabled={isInDeliveryZone !== true}
            className={`w-full py-4 rounded-lg font-semibold text-lg transition ${
              isInDeliveryZone === true
                ? "bg-orange-500 hover:bg-orange-600 text-white cursor-pointer shadow-lg"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isInDeliveryZone === true ? "Продолжить" : "Продолжить"}
          </button>

          {selectedAddress && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg text-sm">
              <p>
                <strong>Адрес:</strong> {selectedAddress.name}
              </p>
              <p className="text-xs text-gray-600 mt-2">
                Координаты: {selectedAddress.coords[0].toFixed(6)}, {selectedAddress.coords[1].toFixed(6)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
