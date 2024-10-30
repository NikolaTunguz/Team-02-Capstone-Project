import React from 'react';
import { Formik } from "formik";
import { InputLabel, Stack, OutlinedInput, Button } from "@mui/material";
// import { object, string } from 'yup';

const AuthLogin = () => {
  return (
    <Formik
      // initialValues={{
      //   email: "",
      //   password: "",
      //   submit: false,
      // }}
      // validationSchema={object().shape({
      //   email: string()
      //     .email("Must be a valid email")
      //     .max(255)
      //     .required("Email is required"),
      //   password: string()
      //     .max(255)
      //     .required("Password is required"),
      // })}
    >
      <Stack spacing={2} sx={{ width: '100%' }}>
        <br/>
        <Stack spacing={1} sx={{ width: '100%' }}>
          <InputLabel htmlFor="email-login">Email Address</InputLabel>
          <OutlinedInput
            id="email-login"
            type="email"
            fullWidth
            placeholder="Enter email address"
          />
        </Stack>
        <br/>
        <Stack spacing={1} sx={{ width: '100%' }}>
          <InputLabel htmlFor="password-login">Password</InputLabel>
          <OutlinedInput
            id="password-login"
            type="password"
            fullWidth
            placeholder="Enter password"
          />
        </Stack>
        <br/>
        <Button
          onClick={() => console.log('Login clicked')}
          fullWidth
          variant="contained"
        >
          Login
        </Button>
      </Stack>
    </Formik>
  );
};

export default AuthLogin;
