// import React, { useState } from 'react';
// import { Formik, Form } from 'formik';
// import { InputLabel, Stack, OutlinedInput, Button, Grid2, InputAdornment, IconButton, FormHelperText } from "@mui/material";
// import { Visibility, VisibilityOff } from "@mui/icons-material";
// import { object, string } from 'yup';
// import httpClient from '../httpClient';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from "../../context/AuthContext";

// const AuthRegister = () => {
//   const formRef = React.useRef(null);
//   const [showPassword, setShowPassword] = useState(false)
//   const [error, setError] = useState("")
//   const navigate = useNavigate();
//   const { setIsLoggedIn } = useAuth();

//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     password: '',
//     phoneNumber: ''
//   });




//   // React.useEffect(() => {
//   //   setIsLoggedIn(false);
//   // }, [])

//   const handleClickShowPass = () => {
//     setShowPassword(!showPassword)
//   }

//   const handleMouseDownPass = (event) => {
//     event.preventDefault();
//   }

//   const handleChange = (e) => {
//     setError("");
//     formRef.current.handleChange(e);
//   };

//   const register = async (phoneNumber, firstName, lastName, email, password) => {
//     try {
//       const resp = await httpClient.post("http://localhost:8080/register", {
//         first_name: firstName,
//         last_name: lastName,
//         email: email,
//         password: password,
//       });
//       if (resp.status === 200) {
//         setIsLoggedIn(true);
//         navigate("/dashboard")
//       }
//     } catch (e) {
//       if (e.response?.status === 409) {
//         setError("User already exists");
//       } else {
//         console.error("Registration error:", e.response?.data || e.message);
//         setError(e.message ?? "An error occurred");
//       }
//     }
//   };

//   return (
//     <>
//       <h1> Sign up to SeeThru </h1>
//       <Formik
//         innerRef={formRef}
//         initialValues={{
//           phoneNumber: "",
//           firstName: "",
//           lastName: "",
//           email: "",
//           password: "",
//         }}
//         validationSchema={object().shape({
//           phoneNumber: string()
//             .max(15)
//             .required("Phone number is required"),
//           firstName: string()
//             .max(25)
//             .required("First name is required"),
//           lastName: string()
//             .max(25)
//             .required("Last name is required"),
//           email: string()
//             .email("Must be a valid email")
//             .max(255)
//             .required("Email is required"),
//           password: string()
//             .max(255)
//             .required("Password is required")
//             .min(8, "Password must be at least 8 characters long")
//         })}
//         onSubmit={async ({ phoneNumber, firstName, lastName, email, password }, { setErrors, setStatus }) => {
//           try {
//             await register(phoneNumber, firstName, lastName, email, password); 
//             setStatus({ success: true }); 
//           } catch (e) {
//             setStatus({ success: false });
//             setErrors({ submit: e.message });
//           }
//         }}
//       >
//         {({
//           errors,
//           handleBlur,
//           handleSubmit,
//           isValid,
//           dirty,
//           touched,
//           values,
//         }) => (
//           <Form onSubmit={handleSubmit}>
//             <Stack spacing={2} sx={{ width: '100%' }}>
//               <InputLabel>First Name</InputLabel>
//               <OutlinedInput
//                 type="text"
//                 name="firstName"
//                 value={values.firstName}
//                 onChange={handleChange}
//                 onBlur={handleBlur}
//                 fullWidth
//                 placeholder="First Name"
//                 error={Boolean(touched.firstName && errors.firstName)}
//               />
//               {touched.firstName && errors.firstName && (
//                 <FormHelperText error> {errors.firstName} </FormHelperText>
//               )}
//               <InputLabel>Last Name</InputLabel>
//               <OutlinedInput
//                 type="text"
//                 name="lastName"
//                 value={values.lastName}
//                 onChange={handleChange}
//                 onBlur={handleBlur}
//                 fullWidth
//                 placeholder="Last Name"
//                 error={Boolean(touched.lastName && errors.lastName)}
//               />
//               {touched.lastName && errors.lastName && (
//                 <FormHelperText error> {errors.lastName} </FormHelperText>
//               )}
//               <InputLabel>Email Address</InputLabel>
//               <OutlinedInput
//                 type="email"
//                 name="email"
//                 value={values.email}
//                 onChange={handleChange}
//                 onBlur={handleBlur}
//                 fullWidth
//                 placeholder="Email"
//                 error={Boolean(touched.email && errors.email)}
//               />
//               {touched.email && errors.email && (
//                 <FormHelperText error> {errors.email} </FormHelperText>
//               )}
//               <InputLabel>Password</InputLabel>
//               <OutlinedInput
//                 name="password"
//                 type={showPassword ? "text" : "password"}
//                 value={values.password}
//                 onChange={handleChange}
//                 onBlur={handleBlur}
//                 fullWidth
//                 placeholder="Password"
//                 error={Boolean(touched.password && errors.password)}
//                 endAdornment={
//                   values.password.length > 0 && (
//                     <InputAdornment position="end">
//                       <IconButton
//                         aria-label="toggle password visibility"
//                         onClick={handleClickShowPass}
//                         onMouseDown={handleMouseDownPass}
//                         edge="end"
//                         size="large"
//                       >
//                         {showPassword ? <Visibility /> : <VisibilityOff />}
//                       </IconButton>
//                     </InputAdornment>
//                   )
//                 }
//               />
//               {touched.password && errors.password && (
//                 <FormHelperText error> {errors.password} </FormHelperText>
//               )}
//               <Button
//                 type="submit"
//                 fullWidth
//                 variant="contained"
//                 disabled={!(isValid && dirty)}
//               >
//                 Register
//               </Button>
//               {errors.submit && (
//                 <Grid2 xs={12}>
//                   <FormHelperText error> {errors.submit} </FormHelperText>
//                 </Grid2>
//               )}
//               {error && isValid ? <Grid2 xs={12}>
//                 <Stack spacing={1}>
//                   <FormHelperText error> {error} </FormHelperText>
//                 </Stack>
//               </Grid2> : null}
//               <Grid2
//                 xs={4}
//                 container
//                 alignItems="center"
//               >
//                 <p>Already have an account? </p>
//                 <Button
//                   onClick={() => navigate("/login")}
//                 >
//                   <p>Log In</p>
//                 </Button>
//               </Grid2>
//             </Stack>
//           </Form>
//         )}
//       </Formik>
//     </>
//   );
// };

// export default AuthRegister;


import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import {
  InputLabel,
  Stack,
  OutlinedInput,
  Button,
  InputAdornment,
  IconButton,
  FormHelperText,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { styled } from '@mui/material/styles'
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector'
import Check from '@mui/icons-material/Check';
import PropTypes from 'prop-types';

import { object, string } from 'yup';
import httpClient from '../httpClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AuthRegister = () => {
  const formRef = React.useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setIsLoggedIn } = useAuth();
  const [activeStep, setActiveStep] = useState(0);

  const steps = ['Email', 'Password', 'Name', 'Phone'];

  const handleChange = (e) => {
    setError("");
    formRef.current.handleChange(e);
  };

  const handleClickShowPass = () => {
    setShowPassword(!showPassword);
  };

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
        navigate('/dashboard');
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
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const QontoConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
      top: 10,
      left: 'calc(-50% + 16px)',
      right: 'calc(50% + 16px)',
    },
    [`&.${stepConnectorClasses.active}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        borderColor: '#784af4',
      },
    },
    [`&.${stepConnectorClasses.completed}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        borderColor: '#784af4',
      },
    },
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: '#eaeaf0',
      borderTopWidth: 3,
      borderRadius: 1,
      ...theme.applyStyles('dark', {
        borderColor: theme.palette.grey[800],
      }),
    },
  }));

  const QontoStepIconRoot = styled('div')(({ theme }) => ({
    color: '#eaeaf0',
    display: 'flex',
    height: 22,
    alignItems: 'center',
    '& .QontoStepIcon-completedIcon': {
      color: '#784af4',
      zIndex: 1,
      fontSize: 18,
    },
    '& .QontoStepIcon-circle': {
      width: 8,
      height: 8,
      borderRadius: '50%',
      backgroundColor: 'currentColor',
    },
    ...theme.applyStyles('dark', {
      color: theme.palette.grey[800],
    }),
    variants: [
      {
        props: ({ ownerState }) => ownerState.active,
        style: {
          color: '#784af4',
        },
      },
    ],
  }));

  function QontoStepIcon(props) {
    const { active, completed, className } = props;
  
    return (
      <QontoStepIconRoot ownerState={{ active }} className={className}>
        {completed ? (
          <Check className="QontoStepIcon-completedIcon" />
        ) : (
          <div className="QontoStepIcon-circle" />
        )}
      </QontoStepIconRoot>
    );
  }

  QontoStepIcon.propTypes = {
    /**
     * Whether this step is active.
     * @default false
     */
    active: PropTypes.bool,
    className: PropTypes.string,
    /**
     * Mark the step as completed. Is passed to child components.
     * @default false
     */
    completed: PropTypes.bool,
  };





  return (
    <>
      {activeStep == 0 && <h1>Sign up to SeeThru</h1>}
      <Stepper activeStep={activeStep} connector={<QontoConnector/>} alternativeLabel>
        {steps.map((label, index) => (
          <Step key={index}>
            <StepLabel StepIconComponent={QontoStepIcon}>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Formik
        innerRef={formRef}
        initialValues={{
          phoneNumber: '',
          firstName: '',
          lastName: '',
          email: '',
          password: ''
        }}
        validationSchema={object().shape({
          phoneNumber: string()
            .max(15, "Phone number must be at most 15 characters")
            .required('Phone number is required'),
          firstName: string()
            .max(25, "First name must be at most 25 characters")
            .required('First name is required'),
          lastName: string()
            .max(25, "Last name must be at most 25 characters")
            .required('Last name is required'),
          email: string()
            .email('Must be a valid email')
            .max(255)
            .required('Email is required'),
          password: string()
            .max(255)
            .required('Password is required')
            .min(8, 'Password must be at least 8 characters long')
        })}
        onSubmit={async ({ phoneNumber, firstName, lastName, email, password }, { setErrors, setStatus }) => {
          try {
            if (activeStep === 2) {
              await register(phoneNumber, firstName, lastName, email, password);
              setStatus({ success: true });
            } else {
              handleNext();
            }
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
              <>
                <InputLabel>Password</InputLabel>
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
              </>
            )}

            {activeStep === 2 && (
              <>
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

            {activeStep === 3 ? (
              <Button type="submit" fullWidth variant="contained" disabled={!(isValid && dirty)}>
                Register
              </Button>
            ) : (
              <Button
                fullWidth
                variant="contained"
                onClick={handleNext}
                disabled={activeStep === 0 && !(values.email)
                  || activeStep === 1 && !(values.password)
                  || activeStep === 2 && !(values.firstName && values.lastName)}
              >
                Next
              </Button>
            )}
            {activeStep > 0 && (
              <Button
                fullWidth
                variant="contained"
                onClick={handleBack}
              >
                Back
              </Button>
            )}
            </Stack>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default AuthRegister;
