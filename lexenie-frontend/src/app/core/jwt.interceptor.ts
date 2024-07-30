import { HttpRequest, HttpHandlerFn, HttpEvent } from "@angular/common/http";
import { Observable } from "rxjs";

export function JWTInterceptor(req: HttpRequest<unknown>,
  next: HttpHandlerFn): Observable<HttpEvent<unknown>> {

  const idToken = localStorage.getItem("id_token");

  if (idToken) {
    const cloned = req.clone({
      headers: req.headers.set("Authorization",
        "Bearer " + idToken)
    });

    return next(cloned);
  }

  return next(req);
}