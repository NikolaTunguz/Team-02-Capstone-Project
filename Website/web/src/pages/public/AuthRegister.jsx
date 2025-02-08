import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import { InputLabel, Stack, OutlinedInput, Button, InputAdornment, IconButton, FormHelperText, LinearProgress, Box } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import * as yup from 'yup';
import httpClient from '../httpClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AuthRegister = () => {
  const formRef = React.useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfPassword, setShowConfPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setIsLoggedIn } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const handleChange = (e) => {
    setError("");
    formRef.current.handleChange(e);
  };

  const getPasswordRequirements = (password) => {
    return [
      { label: "One uppercase letter", valid: /[A-Z]/.test(password) },
      { label: "1 number or special character", valid: /[\d@$!%*?&]/.test(password) },
      { label: "10 characters", valid: password.length >= 10 },
    ];
  };

  const handleClickShowPass = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowPassConf = () => {
    setShowConfPassword(!showConfPassword);
  }

  const handleMouseDownPass = (event) => {
    event.preventDefault();
  };

  const register = async (phoneNumber, firstName, lastName, email, password) => {
    try {
      const resp = await httpClient.post('http://localhost:8080/register', {
        phone_number: phoneNumber,
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password
      });
      if (resp.status === 200) {
        setIsLoggedIn(true);
        navigate('/cameras');
      }
    } catch (e) {
      if (e.response?.status === 409) {
        setError('User already exists');
      } else {
        console.error('Registration error:', e.response?.data || e.message);
        setError(e.message ?? 'An error occurred');
      }
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
    setProgress((prevProgress) => prevProgress + 25)
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setProgress((prevProgress) => prevProgress - 25)
  };

  return (
    <Box
      sx={{
        height: '435px',
        width: '290px',
        overflow: 'hidden',
        // display: 'flex',
        // flexDirection: 'column',
        position: 'relative',
      }}
    >
      {activeStep == 0 && <h1>Sign up to SeeThru</h1>}
      {activeStep > 0 && <Box sx={{ width: '80%', padding: 2 }}>
        <LinearProgress variant="determinate" value={progress} />
      </Box>}

      <Formik
        innerRef={formRef}
        initialValues={{
          phoneNumber: '',
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          passwordConf: ''
        }}
        validationSchema={yup.object().shape({
          phoneNumber: yup
            .string()
            .matches(/^\d{10,15}$/, "Phone number is not valid")
            .required('Phone number is required'),
          firstName: yup
            .string()
            .max(25, "First name must be at most 25 characters")
            .required('First name is required'),
          lastName: yup
            .string()
            .max(25, "Last name must be at most 25 characters")
            .required('Last name is required'),
          email: yup
            .string()
            .email('Must be a valid email')
            .max(255)
            .required('Email is required'),
          password: yup
            .string()
            .required(),
          passwordConf: yup
            .string()
            .oneOf([yup.ref('password')], 'Passwords must match')
            .required('Confirm password is required')
        })}

        onSubmit={async ({ phoneNumber, firstName, lastName, email, password }, { setErrors, setStatus }) => {
          try {
            await register(phoneNumber, firstName, lastName, email, password);
            setStatus({ success: true });
          } catch (e) {
            setStatus({ success: false });
            setErrors({ submit: e.message });
          }
        }}
      >
        {({
          errors,
          handleBlur,
          handleSubmit,
          isValid,
          dirty,
          touched,
          values
        }) => (
          <Form onSubmit={handleSubmit}>
            <Box
              sx={{
                marginTop: activeStep === 2 || activeStep === 1 ? '0px' : '75px',
                overflow: 'hidden',
                // display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <Stack spacing={2} sx={{ width: '100%' }}>
                {activeStep === 0 && (
                  <>
                    <InputLabel>Email Address</InputLabel>
                    <OutlinedInput
                      type="email"
                      name="email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      fullWidth
                      placeholder="Email"
                      error={Boolean(touched.email && errors.email)}
                    />
                    {touched.email && errors.email && (
                      <FormHelperText error>{errors.email}</FormHelperText>
                    )}
                  </>
                )}

                {activeStep === 1 && (
                  <Box sx={{ paddingRight: '10px' }}>
                    <InputLabel style={{ fontSize: '16px', marginBottom: '10px' }}>
                      Create a password
                    </InputLabel>
                    <b />
                    <InputLabel style={{ fontSize: '16px', marginBottom: '10px' }}>Password</InputLabel>
                    <OutlinedInput
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      fullWidth
                      placeholder="Password"
                      error={Boolean(touched.password && errors.password)}
                      endAdornment={
                        values.password.length > 0 && (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowPass}
                              onMouseDown={handleMouseDownPass}
                              edge="end"
                              size="large"
                            >
                              {showPassword ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }
                    />
                    {touched.password && errors.password && (
                      <FormHelperText error>{errors.password}</FormHelperText>
                    )}

                    <ul style={{
                      display: 'grid',
                      gap: '10px',
                      paddingLeft: '20px',
                      fontSize: '13px',
                      marginTop: '10px',
                    }}>
                      {getPasswordRequirements(values.password).map((req, index) => (
                        <li key={index} style={{ color: req.valid ? 'green' : '#d32f2f' }}>
                          {req.label}
                        </li>
                      ))}
                    </ul>

                    <InputLabel>Confirm Password</InputLabel>
                    <OutlinedInput
                      name="passwordConf"
                      type={showConfPassword ? 'text' : 'password'}
                      value={values.passwordConf}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      fullWidth
                      placeholder="Confirm Password"
                      error={Boolean(touched.passwordConf && errors.passwordConf)}
                      endAdornment={
                        values.passwordConf.length > 0 && (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={handleClickShowPassConf}
                              onMouseDown={handleMouseDownPass}
                              edge="end"
                              size="large"
                            >
                              {showConfPassword ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }
                    />
                    {touched.passwordConf && errors.passwordConf && (
                      <FormHelperText error>{errors.passwordConf}</FormHelperText>
                    )}
                  </Box>
                )}


                {activeStep === 2 && (
                  <>
                    <InputLabel style={{ fontSize: '16px' }}>
                      Enter first and last name
                    </InputLabel>
                    <b />
                    <InputLabel>First Name</InputLabel>
                    <OutlinedInput
                      type="text"
                      name="firstName"
                      value={values.firstName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      fullWidth
                      placeholder="First Name"
                      error={Boolean(touched.firstName && errors.firstName)}
                    />
                    {touched.firstName && errors.firstName && (
                      <FormHelperText error>{errors.firstName}</FormHelperText>
                    )}

                    <InputLabel>Last Name</InputLabel>
                    <OutlinedInput
                      type="text"
                      name="lastName"
                      value={values.lastName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      fullWidth
                      placeholder="Last Name"
                      error={Boolean(touched.lastName && errors.lastName)}
                    />
                    {touched.lastName && errors.lastName && (
                      <FormHelperText error>{errors.lastName}</FormHelperText>
                    )}
                  </>
                )}

                {activeStep === 3 && (
                  <>
                    <InputLabel style={{ fontSize: '16px' }}>
                      Enter phone number
                    </InputLabel>
                    <b />
                    <InputLabel>Phone Number</InputLabel>
                    <OutlinedInput
                      type="text"
                      name="phoneNumber"
                      value={values.phoneNumber}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      fullWidth
                      placeholder="Phone Number"
                      error={Boolean(touched.phoneNumber && errors.phoneNumber)}
                    />
                    {touched.phoneNumber && errors.phoneNumber && (
                      <FormHelperText error>{errors.phoneNumber}</FormHelperText>
                    )}
                  </>
                )}
              </Stack>
            </Box>
            <br />
            <Box
              sx={{
                // display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '10px',
              }}
            >

              <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                {activeStep > 0 && (
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleBack}
                  >
                    Back
                  </Button>
                )}
                {activeStep === 3 ? (
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={!(isValid && dirty)}
                  >
                    Register
                  </Button>
                ) : (
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleNext}
                    disabled={
                      Boolean(activeStep === 0 && (!values.email || errors.email)) ||
                      Boolean(activeStep === 1 && (!values.password || errors.password || !values.passwordConf || errors.passwordConf)) ||
                      Boolean(activeStep === 2 && (!values.firstName || !values.lastName || errors.firstName || errors.lastName)) ||
                      Boolean(activeStep === 3 && (!values.phoneNumber || errors.phoneNumber))
                    }
                  >
                    Next
                  </Button>

                )}
              </div>

              {activeStep == 0 && (
                <div style={{ display: 'flex' }}>
                  <p style={{ marginTop: '20px' }}>
                    Already have an account?
                  </p>
                  <Button
                    onClick={() => navigate("/login")}
                  >
                    <p>Login</p>
                  </Button>
                </div>
              )}

            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default AuthRegister;