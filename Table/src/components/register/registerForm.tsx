import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';

import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import z from 'zod';
import { api } from '@/api/client';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/context/authContext';

//defining register schema
const registerSchema = z
  .object({
    mobile: z
      .string()
      .min(10, { message: 'Mobile must be more than 10 digits' }),
    name: z.string().min(3, { message: 'Name must be more than 3 charaters' }),
    email: z.email({ message: 'Enter a valid email address' }),
    password: z
      .string()
      .min(6, { message: 'Password must be more than 6 charaters' }),
    confirmedPassword: z
      .string()
      .min(6, { message: 'Password must be more than 6 charaters' }),
  })
  .refine((data) => data.password === data.confirmedPassword, {
    message: 'Password and confirmed password not matching',
    path: ['confirmedPassword'],
  });

//register type
type registerInputs = z.infer<typeof registerSchema>;

//define default register value
const defaultRegisterValues: registerInputs = {
  email: '',
  password: '',
  confirmedPassword: '',
  mobile: '',
  name: '',
};

const RegisterForm = () => {
  //auth context
  const { dispatch } = useAuthContext();

  //router
  const navigate = useNavigate();
  //form
  const form = useForm<registerInputs>({
    defaultValues: defaultRegisterValues,
    resolver: zodResolver(registerSchema),
    mode: 'onSubmit',
  });

  //on submit
  const onSubmit = async (inputs: registerInputs) => {
    const response = await api.register({
      email: inputs.email,
      name: inputs.name,
      password: inputs.password,
      mobile: inputs.mobile,
    });
    //on success, navigate to chart page
    navigate('/chart');
    dispatch({ type: 'SET_TOKEN', payload: response.data.access_token });
    // Store token in localStorage
    localStorage.setItem('token', response.data.access_token);
    // Store user in localStorage
    localStorage.setItem('user', JSON.stringify(response.data.user));
  };

  //is penidng, loading
  const isPending = form.formState.isSubmitting;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-10">
      <Card className="w-full max-w-xl text-center capitalize">
        <CardHeader>
          <h1 className="text-2xl font-bold gradient-text bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary">
            FOXWARE
          </h1>
          <CardTitle>Register new account</CardTitle>
          <CardDescription>registration in Foxware</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {/* register with social btns */}
              <div className="flex flex-col gap-6">
                {/* input fields */}
                <div className="grid gap-6">
                  {/* name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ahmed Eldessouki"
                            type="text"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                  {/* confirmed password */}
                  <FormField
                    control={form.control}
                    name="confirmedPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirme Password</FormLabel>
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
                  {/* mobile */}
                  <FormField
                    control={form.control}
                    name="mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile No</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+971 XXXXXXXX"
                            type="tel"
                            pattern="^\+971(50|52|54|55|56|58)\d{7}$"
                            title="Please enter a valid UAE mobile number"
                            maxLength={13}
                            minLength={13}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {/* login and submit btn */}
                <Button
                  variant="default"
                  type="submit"
                  className="w-full cursor-pointer"
                  disabled={isPending}
                >
                  {isPending ? <Spinner /> : 'Register /sign up'}
                </Button>

                {/* dont have account */}
                <div className="text-sm mt-5">
                  dont have account{' '}
                  <Link
                    className=" underline ring-offset-4"
                    to="/login"
                    replace={true}
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterForm;
