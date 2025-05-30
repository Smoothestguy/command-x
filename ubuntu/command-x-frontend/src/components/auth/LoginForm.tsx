import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../features/auth/authSlice";
import { AppDispatch, RootState } from "../../store/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

const LoginForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  const { login } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Admin credentials for demo
  const adminEmail = "admin@example.com";

  const formik = useFormik({
    initialValues: {
      email: adminEmail,
      password: "", // Admin password is admin123
    },
    validationSchema: LoginSchema,
    onSubmit: async (values) => {
      try {
        setIsAuthLoading(true);
        setLoginError(null);

        // Use Redux login directly since it's already set up in the app
        const resultAction = await dispatch(
          loginUser({
            username: values.email === adminEmail ? "admin" : values.email,
            password: values.password,
          })
        );

        if (loginUser.fulfilled.match(resultAction)) {
          // If Redux login succeeds, also update our AuthContext
          await login(values.email, values.password);

          // Navigate to dashboard
          navigate("/dashboard");
        } else {
          // If we get here, the login failed but didn't throw an error
          setLoginError(
            "Invalid credentials. Please check your email and password."
          );
        }
      } catch (err: any) {
        setLoginError(
          err?.message || "Login failed. Please check your credentials."
        );
        console.error("Login error:", err);
      } finally {
        setIsAuthLoading(false);
      }
    },
    enableReinitialize: true,
  });

  return (
    <Card className="w-[350px]">
      <CardHeader className="text-center">
        <div className="mb-4 flex justify-center">
          <img
            src="/command-x-logo.png"
            alt="Command X Logo"
            className="h-16"
          />
        </div>
        <CardTitle>Login to Command X</CardTitle>
        <CardDescription>Enter your credentials below.</CardDescription>
      </CardHeader>
      <form onSubmit={formik.handleSubmit}>
        <CardContent className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-md mb-2">
            <p className="text-sm text-blue-800">
              <strong>Admin Login:</strong>
              <br />
              Email: admin@example.com
              <br />
              Password: admin123
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              placeholder="admin@example.com"
              required
            />
            {formik.touched.email && formik.errors.email ? (
              <div className="text-red-500 text-sm">{formik.errors.email}</div>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
              placeholder="Your password"
              required
            />
            {formik.touched.password && formik.errors.password ? (
              <div className="text-red-500 text-sm">
                {formik.errors.password}
              </div>
            ) : null}
          </div>
          {(error || loginError) && (
            <div className="text-red-500 text-sm text-center">
              {loginError || error}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || isAuthLoading}
          >
            {isLoading || isAuthLoading ? "Logging in..." : "Login"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LoginForm;
