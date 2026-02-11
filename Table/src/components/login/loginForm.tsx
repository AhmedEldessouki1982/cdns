import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useAuthContext } from '@/context/authContext';
import { api } from '@/api/client';
import { toast } from 'sonner';

//define form schema
const loginSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
  remember: z.boolean().optional(),
});

//login inputs extends the type of login schema
type loginInputs = z.infer<typeof loginSchema>;

//defualt login values
const defaultLoginValues: loginInputs = {
  email: '',
  password: '',
  remember: false,
};

const LoginForm = () => {
  const navigate = useNavigate();
  const { dispatch } = useAuthContext();
  const form = useForm<loginInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: defaultLoginValues,
    mode: 'onSubmit',
  });

  //on submit
  const onSubmit = async (inputs: loginInputs) => {
    try {
      dispatch({ type: 'SET_IS_PENDING', payload: true });
      const response = await api.signin({
        email: inputs.email,
        password: inputs.password,
      });

      const { access_token } = response.data;

      navigate('/chart');
      dispatch({ type: 'SET_TOKEN', payload: access_token });
      dispatch({ type: 'SET_USER', payload: response.data.user });
      // Store token in localStorage
      localStorage.setItem('token', access_token);
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user));
      //toast success
      toast.success('Login successful');
    } catch (error: any) {
      console.error('Login failed:', error);
      form.setError('root', {
        message:
          error.response?.data?.message ||
          'Login failed. Please check your credentials.',
      });
    } finally {
      dispatch({ type: 'SET_IS_PENDING', payload: false });
    }
  };

  //is pending, loading
  const isPending = form.formState.isSubmitting;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-10">
      <div className="w-full max-w-xl">
        <Card className="text-center capitalize">
          <CardHeader>
            <h1 className="text-2xl font-bold gradient-text bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary">
              FOXWARE
            </h1>
            <CardTitle>login page / welcome back</CardTitle>
            <CardDescription>login to continue</CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-5">
                  {/* input fields */}
                  <div className="grid gap-5">
                    {/* email */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="example@company.com"
                              type="email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* password */}
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="******"
                              type="password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {/* error message */}
                  {form.formState.errors.root && (
                    <div className="text-destructive text-sm">
                      {form.formState.errors.root.message}
                    </div>
                  )}
                  {/* login and submit btn */}
                  <Button
                    variant="default"
                    type="submit"
                    className="w-full cursor-pointer"
                    disabled={isPending}
                  >
                    {isPending ? <Spinner /> : 'Login'}
                  </Button>
                </div>
                {/* dont have account */}
                <div className="text-sm mt-5">
                  dont have account{' '}
                  <Link className=" underline ring-offset-4" to="/register">
                    sign up
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
