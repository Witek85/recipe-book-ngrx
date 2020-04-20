import { Actions, ofType, Effect } from '@ngrx/effects';
import * as AuthActions from './auth.actions';
import { of } from 'rxjs';
import { switchMap, catchError, map, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export interface AuthResponseData {
    kind: string;
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    registered?: boolean;
}

const handleAuthentication = (resData: any) => {
    console.log('resData', resData);
    const expirationDate = new Date(new Date().getTime() + +resData.expiresIn * 1000);
    return new AuthActions.AuthenticateSuccess({
        email: resData.email,
        userId: resData.localId,
        token: resData.idToken,
        expirationDate: expirationDate
    });
};

const handleError = (errorRes: any) => {
    let errorMessage = 'An unknown error occurred!';
    if (!errorRes.error || !errorRes.error.error) {
    return of(new AuthActions.AuthenticateFail(errorMessage));
    }
    switch (errorRes.error.error.message) {
    case 'EMAIL_EXISTS':
        errorMessage = 'This email exists already';
        break;
    case 'EMAIL_NOT_FOUND':
        errorMessage = 'This email does not exist.';
        break;
    case 'INVALID_PASSWORD':
        errorMessage = 'This password is not correct.';
        break;
    }
    // of - create a new observable
    return of(new AuthActions.AuthenticateFail(errorMessage));
};

@Injectable()
export class AuthEffects {
    @Effect()
    authSignUp = this.actions$.pipe(
        // this effect will filter - trigger only when SIGNUP_START happens
        ofType(AuthActions.SIGNUP_START),
        // return new observable
        switchMap((signUpAction: AuthActions.SignUpStart) => {
            return this.http
            .post<AuthResponseData>(
              'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + environment.firebaseAPIKey,
              {
                email: signUpAction.payload.email,
                password: signUpAction.payload.password,
                returnSecureToken: true
              }
            ).pipe(
                map(resData => {
                    return handleAuthentication(resData);
                }),
                catchError(errorRes => {
                    return handleError(errorRes);
                }),
            )
        })
    );

    @Effect()
    authLogin = this.actions$.pipe(
        // this effect will filter - trigger only when LOGIN_START happens
        ofType(AuthActions.LOGIN_START),
        // return new observable
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
                    return handleAuthentication(resData);
                }),
                catchError(errorRes => {
                    return handleError(errorRes);
                }),
            )
        }),
    );

    @Effect({ dispatch: false })
    authSuccess = this.actions$.pipe(
        ofType(AuthActions.AUTHENTICATE_SUCCESS),
        tap(() => {
            this.router.navigate(['/']);
        })
    )

    constructor(private actions$: Actions, private http: HttpClient, private router: Router) {}
}