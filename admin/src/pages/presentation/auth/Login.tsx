import React, { FC, useCallback, useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { useFormik } from 'formik'
import PageWrapper from '../../../layout/PageWrapper/PageWrapper'
import Page from '../../../layout/Page/Page'
import Card, { CardBody } from '../../../components/bootstrap/Card'
import FormGroup from '../../../components/bootstrap/forms/FormGroup'
import Input from '../../../components/bootstrap/forms/Input'
import Button from '../../../components/bootstrap/Button'
import Logo from '../../../components/Logo'
import useDarkMode from '../../../hooks/useDarkMode'
import AuthContext from '../../../contexts/authContext'
import Spinner from '../../../components/bootstrap/Spinner'
import Alert from '../../../components/bootstrap/Alert'
import axios from 'axios'

interface ILoginHeaderProps {
  isNewUser?: boolean;
}
const LoginHeader: FC<ILoginHeaderProps> = ({ isNewUser }) => {
  if (isNewUser) {
    return (
      <>
        <div className="text-center h1 fw-bold mt-5">Create Account,</div>
        <div className="text-center h4 text-muted mb-5">Sign up to get started!</div>
      </>
    )
  }
  return (
    <>
      <div className="text-center h1 fw-bold mt-5">Welcome,</div>
      <div className="text-center h4 text-muted mb-5">Sign in to continue!</div>
    </>
  )
}
LoginHeader.defaultProps = {
  isNewUser: false
}

interface ILoginProps {
  isSignUp?: boolean;
}

const Login: FC<ILoginProps> = ({ isSignUp }) => {
  const { setUser } = useContext(AuthContext)

  const { darkModeStatus } = useDarkMode()

  const [signInPassword, setSignInPassword] = useState<boolean>(false)
  const [singUpStatus, setSingUpStatus] = useState<boolean>(!!isSignUp)

  const navigate = useNavigate()
  const handleOnClick = useCallback(() => navigate('/'), [navigate])

  // const usernameCheck = (username: string) => {
  // 	return !!getUserDataWithUsername(username);
  // };

  // const passwordCheck = (username: string, password: string) => {
  // 	return getUserDataWithUsername(username).password === password;
  // };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      loginUsername: '',
      loginPassword: '',
      signupEmail: '',
      signupUsername: '',
      signupPassword: ''
    },
    validate: (values) => {
      const errors: { loginUsername?: string; loginPassword?: string; signupEmail?: string; signupUsername?: string; signupPassword?: string; } = {}

      if (singUpStatus) {
        if (!values.signupEmail) {
          errors.signupEmail = 'Required'
        }
        if (!values.signupUsername) {
          errors.signupUsername = 'Required'
        }
        if (!values.signupPassword) {
          errors.signupPassword = 'Required'
        }
      } else {
        if (!values.loginUsername) {
          errors.loginUsername = 'Required'
        }

        if (!values.loginPassword) {
          errors.loginPassword = 'Required'
        }
      }

      return errors
    },
    validateOnChange: false,
    onSubmit: (values) => {
      if (!singUpStatus) {
        axios.post(
          `http://localhost:3012/api/auth/signin`,
          {
            username: values.loginUsername,
            password: values.loginPassword
          }
        ).then(res => {
          const persons = res.data
          if (persons) {
            if (setUser) {
              setUser(persons.username)
              handleOnClick()
            }
          }
        }).catch(res => {
          formik.setFieldError('loginPassword', 'Username and password do not match.')
        })
      } else {
        axios.post(
          `http://localhost:3012/api/auth/signup`,
          {
            username: values.signupUsername,
            password: values.signupPassword,
            email: values.signupEmail,
            roles: ['user'],
          }
        ).then(res => {
          const persons = res.data
          if (persons) {
            if (setUser) {
              setUser(persons.username)
              handleOnClick()
            }
          }
        }).catch(res => {
          // TODO: Сделать обработку ошибок при регистрации
          // formik.setFieldError('loginPassword', 'Username and password do not match.')
        })
      }

      // if (usernameCheck(values.loginUsername)) {
      // 	if (passwordCheck(values.loginUsername, values.loginPassword)) {
      // 		if (setUser) {
      // 			setUser(values.loginUsername);
      // 		}
      //
      // 		handleOnClick();
      // 	} else {
      // 		formik.setFieldError('loginPassword', 'Username and password do not match.');
      // 	}
      // }
    }
  })

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const handleContinue = () => {
    setSignInPassword(true)
    // setIsLoading(true)
    // setTimeout(() => {
    // 	if (
    // 		!Object.keys(USERS).find(
    // 			(f) => USERS[f].username.toString() === formik.values.loginUsername,
    // 		)
    // 	) {
    // 		formik.setFieldError('loginUsername', 'No such user found in the system.');
    // 	} else {
    //
    // 	}
    // 	setIsLoading(false);
    // }, 1000);
  }

  return (
    <PageWrapper
      isProtected={false}
      title={singUpStatus ? 'Sign Up' : 'Login'}
      className={classNames({ 'bg-dark': !singUpStatus, 'bg-light': singUpStatus })}>
      <Page className="p-0">
        <div className="row h-100 align-items-center justify-content-center">
          <div className="col-xl-4 col-lg-6 col-md-8 shadow-3d-container">
            <Card className="shadow-3d-dark" data-tour="login-page">
              <CardBody>
                <div className="text-center my-5">
                  <Link
                    to="/"
                    className={classNames(
                      'text-decoration-none  fw-bold display-2',
                      {
                        'text-dark': !darkModeStatus,
                        'text-light': darkModeStatus
                      }
                    )}
                    aria-label="Facit">
                    <Logo width={200} />
                  </Link>
                </div>
                <div
                  className={classNames('rounded-3', {
                    'bg-l10-dark': !darkModeStatus,
                    'bg-dark': darkModeStatus
                  })}>
                  <div className="row row-cols-2 g-3 pb-3 px-3 mt-0">
                    <div className="col">
                      <Button
                        color={darkModeStatus ? 'light' : 'dark'}
                        isLight={singUpStatus}
                        className="rounded-1 w-100"
                        size="lg"
                        onClick={() => {
                          setSignInPassword(false)
                          setSingUpStatus(!singUpStatus)
                        }}>
                        Login
                      </Button>
                    </div>
                    <div className="col">
                      <Button
                        color={darkModeStatus ? 'light' : 'dark'}
                        isLight={!singUpStatus}
                        className="rounded-1 w-100"
                        size="lg"
                        onClick={() => {
                          setSignInPassword(false)
                          setSingUpStatus(!singUpStatus)
                        }}>
                        Sign Up
                      </Button>
                    </div>
                  </div>
                </div>

                <LoginHeader isNewUser={singUpStatus} />

                {/*<Alert isLight icon='Lock' isDismissible>*/}
                {/*	<div className='row'>*/}
                {/*		<div className='col-12'>*/}
                {/*			<strong>Username:</strong> {USERS.JOHN.username}*/}
                {/*		</div>*/}
                {/*		<div className='col-12'>*/}
                {/*			<strong>Password:</strong> {USERS.JOHN.password}*/}
                {/*		</div>*/}
                {/*	</div>*/}
                {/*</Alert>*/}
                <form className="row g-4">
                  {singUpStatus ? (
                    <>
                      <div className="col-12">
                        <FormGroup
                          id="signupEmail"
                          isFloating
                          label="Your email">
                          <Input
                            type="email"
                            autoComplete="email"
                            value={formik.values.signupEmail}
                            isTouched={formik.touched.signupEmail}
                            invalidFeedback={
                              formik.errors.signupEmail
                            }
                            isValid={formik.isValid}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            onFocus={() => {
                              formik.setErrors({})
                            }}
                          />
                        </FormGroup>
                      </div>
                      <div className="col-12">
                        <FormGroup
                          id="signupUsername"
                          isFloating
                          label="Your username">
                          <Input
                            autoComplete="given-name"
                            value={formik.values.signupUsername}
                            isTouched={formik.touched.signupUsername}
                            invalidFeedback={
                              formik.errors.signupUsername
                            }
                            isValid={formik.isValid}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          />
                        </FormGroup>
                      </div>
                      {/*<div className="col-12">*/}
                      {/*  <FormGroup*/}
                      {/*    id="signup-surname"*/}
                      {/*    isFloating*/}
                      {/*    label="Your surname">*/}
                      {/*    <Input*/}
                      {/*      autoComplete="family-name"*/}
                      {/*      value={formik.values.sugnupSurname}*/}
                      {/*      isTouched={formik.touched.sugnupSurname}*/}
                      {/*      invalidFeedback={*/}
                      {/*        formik.errors.sugnupSurname*/}
                      {/*      }*/}
                      {/*      isValid={formik.isValid}*/}
                      {/*      onChange={formik.handleChange}*/}
                      {/*      onBlur={formik.handleBlur}*/}
                      {/*    />*/}
                      {/*  </FormGroup>*/}
                      {/*</div>*/}
                      <div className="col-12">
                        <FormGroup
                          id="signupPassword"
                          isFloating
                          label="Password">
                          <Input
                            type="password"
                            autoComplete="password"
                            value={formik.values.signupPassword}
                            isTouched={formik.touched.signupPassword}
                            invalidFeedback={
                              formik.errors.signupPassword
                            }
                            isValid={formik.isValid}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          />
                        </FormGroup>
                      </div>
                      <div className="col-12">
                        <Button
                          color="info"
                          className="w-100 py-3"
                          isDisable={!formik.values.signupPassword}
                          onClick={formik.handleSubmit}>
                          {isLoading && (
                            <Spinner isSmall inButton isGrow />
                          )}
                          Sign Up
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="col-12">
                        <FormGroup
                          id="loginUsername"
                          isFloating
                          label="Your email or username"
                          className={classNames({
                            'd-none': signInPassword
                          })}>
                          <Input
                            autoComplete="username"
                            value={formik.values.loginUsername}
                            isTouched={formik.touched.loginUsername}
                            invalidFeedback={
                              formik.errors.loginUsername
                            }
                            isValid={formik.isValid}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            onFocus={() => {
                              formik.setErrors({})
                            }}
                          />
                        </FormGroup>
                        {signInPassword && (
                          <div className="text-center h4 mb-3 fw-bold">
                            Hi, {formik.values.loginUsername}.
                          </div>
                        )}
                        <FormGroup
                          id="loginPassword"
                          isFloating
                          label="Password"
                          className={classNames({
                            'd-none': !signInPassword
                          })}>
                          <Input
                            type="password"
                            autoComplete="current-password"
                            value={formik.values.loginPassword}
                            isTouched={formik.touched.loginPassword}
                            invalidFeedback={
                              formik.errors.loginPassword
                            }
                            validFeedback="Looks good!"
                            isValid={formik.isValid}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          />
                        </FormGroup>
                      </div>
                      <div className="col-12">
                        {!signInPassword ? (
                          <Button
                            color="warning"
                            className="w-100 py-3"
                            isDisable={!formik.values.loginUsername}
                            onClick={handleContinue}>
                            {isLoading && (
                              <Spinner isSmall inButton isGrow />
                            )}
                            Continue
                          </Button>
                        ) : (
                          <Button
                            color="warning"
                            className="w-100 py-3"
                            onClick={formik.handleSubmit}>
                            Login
                          </Button>
                        )}
                      </div>
                    </>
                  )}

                  {/* BEGIN :: Social Login */}
                  {!signInPassword && (
                    <>
                      <div className="col-12 mt-3 text-center text-muted">
                        OR
                      </div>
                      <div className="col-12 mt-3">
                        <Button
                          isOutline
                          color={darkModeStatus ? 'light' : 'dark'}
                          className={classNames('w-100 py-3', {
                            'border-light': !darkModeStatus,
                            'border-dark': darkModeStatus
                          })}
                          icon="CustomApple"
                          onClick={handleOnClick}>
                          Sign in with Apple
                        </Button>
                      </div>
                      <div className="col-12">
                        <Button
                          isOutline
                          color={darkModeStatus ? 'light' : 'dark'}
                          className={classNames('w-100 py-3', {
                            'border-light': !darkModeStatus,
                            'border-dark': darkModeStatus
                          })}
                          icon="CustomGoogle"
                          onClick={handleOnClick}>
                          Continue with Google
                        </Button>
                      </div>
                    </>
                  )}
                  {/* END :: Social Login */}
                </form>
              </CardBody>
            </Card>
            <div className="text-center">
              <a
                href="/"
                className={classNames('text-decoration-none me-3', {
                  'link-light': singUpStatus,
                  'link-dark': !singUpStatus
                })}>
                Privacy policy
              </a>
              <a
                href="/"
                className={classNames('link-light text-decoration-none', {
                  'link-light': singUpStatus,
                  'link-dark': !singUpStatus
                })}>
                Terms of use
              </a>
            </div>
          </div>
        </div>
      </Page>
    </PageWrapper>
  )
}
Login.propTypes = {
  isSignUp: PropTypes.bool
}
Login.defaultProps = {
  isSignUp: false
}

export default Login
