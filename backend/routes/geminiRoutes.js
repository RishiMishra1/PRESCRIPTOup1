import express from 'express'

import {routerGem} from '../controllers/routerGem.js'
const geminiRouter=express.Router()

geminiRouter.post('/chat',routerGem)

export default geminiRouter;
