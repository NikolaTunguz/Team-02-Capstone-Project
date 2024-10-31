import React from 'react';
import { Formik, Form } from 'formik';
import { InputLabel, Stack, OutlinedInput, Button, Grid2 } from "@mui/material";
import { object, string } from 'yup';
import httpClient from './httpClient';
import { useNavigate } from 'react-router-dom';

const AuthRegister = () => {
  const navigate = useNavigate();
  const register = async (values) => {
    try {
      const resp = await httpClient.post("http://localhost:8080/register", {
        email: values.email,
        password: values.password,
      });
      if(resp.status === 200){
        window.location.href="/dashboard";
      } 
    } catch (e) {
      console.error("Registration error:", e.response?.data || e.message);
    }
  };

  return (
    <>
        <h1> Sign up to SeeThru </h1>
        <Formik
            initialValues={{
                email: "",
                password: "",
            }}
            validationSchema={object().shape({
                email: string().email("Must be a valid email").max(255).required("Email is required"),
                password: string().max(255).required("Password is required"),
            })}
            onSubmit={register}
        >
        {({ 
            handleChange, 
            handleBlur, 
            handleSubmit, 
            values 
        }) => (
        <Form onSubmit={handleSubmit}>
        <Stack spacing={2} sx={{ width: '100%' }}>
            <InputLabel>Email Address</InputLabel>
            <OutlinedInput
                type="email"
                name="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                fullWidth
                placeholder="Email"
            />
            <InputLabel>Password</InputLabel>
            <OutlinedInput
                type="password"
                name="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                fullWidth
                placeholder="Password"
            />
            <Button 
                type="submit" 
                fullWidth 
                variant="contained" 
            > 
                Register
            </Button>
            <Grid2 
                xs={4} 
                container 
                alignItems="center"
            >
              <p>Already have an account? </p>
              <Button 
                onClick={() => navigate("/login")}
              >
                <p>Log In</p>
              </Button>
            </Grid2>
        </Stack>
        </Form>
        )}
        </Formik>
    </>
  );
};

export default AuthRegister;
