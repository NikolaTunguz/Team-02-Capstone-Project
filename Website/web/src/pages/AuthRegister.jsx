import React from 'react';
import { Formik, Form } from 'formik';
import { InputLabel, Stack, OutlinedInput, Button, Grid2, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { object, string } from 'yup';
import httpClient from './httpClient';
import { useNavigate } from 'react-router-dom';

const AuthRegister = () => {
  const [showPassword, setShowPassword] = React.useState(false)
  const navigate = useNavigate();

  const handleClickShowPass = () => {
    setShowPassword(!showPassword)
  }

  const handleMouseDownPass = (event) => {
    event.preventDefault();
  }

  React.useEffect(() => {
    setShowPassword(false); 
  }, []);

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
        if (e.response?.status === 409) {
          alert("User already exists");
        } else {
          console.error("Registration error:", e.response?.data || e.message);
          alert("Registration failed");
        }
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
                name="password"
                type={showPassword ? "text" : "password"}
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                fullWidth
                placeholder="Password"
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
                    {showPassword ? <Visibility/> : <VisibilityOff/> }
                    </IconButton>
                    </InputAdornment>
                  )
                }
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
