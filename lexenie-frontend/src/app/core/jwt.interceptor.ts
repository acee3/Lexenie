import { HttpRequest, HttpHandlerFn, HttpEvent } from "@angular/common/http";
import { inject } from "@angular/core";
import { Observable } from "rxjs";
import { BrowserStorageService } from "./storage.service";

export function JWTInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const idToken = inject(BrowserStorageService).get("id_token");

  if (idToken) {
    const cloned = req.clone({
      headers: req.headers.set("Authorization",
        "Bearer " + idToken)
    });

    return next(cloned);
  }
  
  return next(req);
}