import { Router } from 'express'
import { fail, ok } from '../http/envelope.js'
import {
  mlTriggerProbabilities,
  resolveRiskScore,
  triggersFromMlProbabilities,
} from '../services/mlClient.js'
import { resolveLatestSensorReading } from '../services/sensorReadings.js'
import { evaluateTriggers, hourIST, type TriggerEvalInput } from '../services/triggerEngine.js'

const router = Router()

router.get('/latest', async (req, res) => {
  try {
    const city = String(req.query['city'] ?? 'Mumbai')
    const latest = await resolveLatestSensorReading(city)
    res.json(ok(latest))
  } catch (error) {
    res.status(500).json(fail('SENSOR_LATEST_FAILED', 'Unable to fetch latest sensor data', error))
  }
})

router.get('/risk', async (req, res) => {
  try {
    const city = String(req.query['city'] ?? 'Mumbai')
    const latest = await resolveLatestSensorReading(city)
    const risk = await resolveRiskScore({
      rainfallMmHr: latest.rainfallMmHr,
      heatIndexC: latest.heatIndexC,
      aqiScore: latest.aqiScore,
      cancelRatePct: latest.cancelRatePct,
      platformStatus: latest.platformStatus as 'online' | 'degraded' | 'outage',
    })
    res.json(ok(risk))
  } catch (error) {
    res.status(500).json(fail('SENSOR_RISK_FAILED', 'Unable to compute risk', error))
  }
})

router.get('/triggers', async (req, res) => {
  try {
    const city = String(req.query['city'] ?? 'Mumbai')
    const latest = await resolveLatestSensorReading(city)
    const now = new Date()
    const sustained = {
      rainfall: latest.rainfallMmHr > 35 ? 60 : 0,
      heat: latest.heatIndexC > 42 ? 50 : 0,
      aqi: latest.aqiScore > 300 ? 190 : 0,
      outage: latest.platformStatus !== 'online' ? 100 : 0,
      demand: latest.cancelRatePct > 45 ? 130 : 0,
    }
    const evalInput: TriggerEvalInput = {
      rainfallMmHr: latest.rainfallMmHr,
      heatIndexC: latest.heatIndexC,
      aqiScore: latest.aqiScore,
      cancelRatePct: latest.cancelRatePct,
      platformStatus: latest.platformStatus as 'online' | 'degraded' | 'outage',
      orderDensity: latest.orderDensity,
      now,
      baselineIncomePaise: 65000,
      sustainedMinutes: sustained,
    }
    const probs = await mlTriggerProbabilities({
      rainfallMmHr: latest.rainfallMmHr,
      heatIndexC: latest.heatIndexC,
      aqiScore: latest.aqiScore,
      cancelRatePct: latest.cancelRatePct,
      platformStatus: latest.platformStatus,
      orderDensity: latest.orderDensity,
      hourIST: hourIST(now),
      sustainedRainMinutes: sustained.rainfall,
      sustainedHeatMinutes: sustained.heat,
      sustainedAqiMinutes: sustained.aqi,
      sustainedOutageMinutes: sustained.outage,
      sustainedDemandMinutes: sustained.demand,
    })
    const triggers = probs ? triggersFromMlProbabilities(probs, evalInput) : evaluateTriggers(evalInput)
    res.json(ok(triggers))
  } catch (error) {
    res.status(500).json(fail('SENSOR_TRIGGERS_FAILED', 'Unable to evaluate triggers', error))
  }
})

export default router

