import React from 'react';
import { Formik, Form, useFormik } from 'formik';
import { InputLabel, Stack, OutlinedInput, Button, Grid2, InputAdornment, IconButton, FormHelperText } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { object, string } from 'yup';
import httpClient from './httpClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";

const AuthRegister = () => {
  const formRef = React.useRef(null);
  const [showPassword, setShowPassword] = React.useState(false)
  const [error, setError] = React.useState("")
  const navigate = useNavigate();
  const { setIsLoggedIn } = useAuth();

  // React.useEffect(() => {
  //   setIsLoggedIn(false);
  // }, [])

  const handleClickShowPass = () => {
    setShowPassword(!showPassword)
  }

  const handleMouseDownPass = (event) => {
    event.preventDefault();
  }

  const handleChange = (e) => {
    setError("");
    formRef.current.handleChange(e);
  };

  const register = async (email, password) => {
    try {
      const resp = await httpClient.post("http://localhost:8080/register", {
        email: email,
        password: password,
      });
      if (resp.status === 200) {
        setIsLoggedIn(true);
        navigate("/dashboard")
      }
    } catch (e) {
      if (e.response?.status === 409) {
        setError("User already exists");
      } else {
        console.error("Registration error:", e.response?.data || e.message);
        setError(e.message ?? "An error occurred");
      }
    }
  };

  return (
    <>
      <h1> Sign up to SeeThru </h1>
      <Formik
        innerRef={formRef}
        initialValues={{
          email: "",
          password: "",
        }}
        validationSchema={object().shape({
          email: string()
            .email("Must be a valid email")
            .max(255).required("Email is required"),
          password: string()
            .max(255)
            .required("Password is required")
            .min(8, "Password must be at least 8 characters long")
        })}
        onSubmit={async ({ email, password }, { setErrors, setStatus }) => {
          try {
            await register(email, password); 
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
          values,
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
                error={Boolean(touched.email && errors.email)}
              />
              {touched.email && errors.email && (
                <FormHelperText error> {errors.email} </FormHelperText>
              )}
              <InputLabel>Password</InputLabel>
              <OutlinedInput
                name="password"
                type={showPassword ? "text" : "password"}
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
                <FormHelperText error> {errors.password} </FormHelperText>
              )}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={!(isValid && dirty)}
              >
                Register
              </Button>
              {errors.submit && (
                <Grid2 xs={12}>
                  <FormHelperText error> {errors.submit} </FormHelperText>
                </Grid2>
              )}
              {error && isValid ? <Grid2 xs={12}>
                <Stack spacing={1}>
                  <FormHelperText error> {error} </FormHelperText>
                </Stack>
              </Grid2> : null}
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
