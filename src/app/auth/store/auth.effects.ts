import { Actions, ofType, Effect } from '@ngrx/effects';
import * as AuthActions from './auth.actions';
import { of } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';

export interface AuthResponseData {
    kind: string;
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    registered?: boolean;
  }

@Injectable()
export class AuthEffects {
    @Effect()
    authLogin = this.actions$.pipe(
        // this effect will trigger only when LOGIN_START happens
        ofType(AuthActions.LOGIN_START),
        switchMap((authData: AuthActions.LoginStart) => {
            console.log(authData.payload);
            return this.http
            .post<AuthResponseData>(
                'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + environment.firebaseAPIKey,
                {
                email: authData.payload.email,
                password: authData.payload.password,
                returnSecureToken: true
                }
            ).pipe(
                map(resData => {
                    console.log('resData', resData);
                    const expirationDate = new Date(new Date().getTime() + +resData.expiresIn * 1000);
                    return of(new AuthActions.Login({
                        email: resData.email,
                        userId: resData.localId,
                        token: resData.idToken,
                        expirationDate: expirationDate
                    }));
                }),
                catchError(error => {
                    // of - create a new observable
                    return of();
                }),
            )
        }),

    );

    constructor(private actions$: Actions, private http: HttpClient) {}
}