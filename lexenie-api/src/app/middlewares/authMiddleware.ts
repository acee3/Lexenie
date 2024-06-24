import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const auth = (req: Request, res: Response, next: NextFunction) =>{
  try {
      //extract JWT token
      const token = req.body.token || req.cookies.token
      if(!token){
          return res.status(401).json({
              success: false,
              message: "Token Missing"
          })
      }

      //verify the token
      try {
          const decode = jwt.verify(token, process.env.JWT_SECRET)
          req.user = decode
          console.log(req.user)
      } catch (error) {
          return res.status(401).json({
              success:false,
              message: "invalid Token ⚠️"
          })
      }

      next()

  } catch (error) {
      return res.status(401).json({
          success:false,
          message: "Error Occured in Authentication ⚠️"
      })
  }
}

export { auth };