// import { Link, Navigate } from "react-router";
// import { z } from "zod";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Button } from "@/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { useState } from "react";

import { Navigate } from 'react-router';

// const forgotPasswordSchema = z.object({
//   email: z.string().email("Please enter a valid email address."),
// });

// type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  // TODO: Implement forgot password
  // const { forgotPassword } = useAuth()
  // const [isSubmitting, setIsSubmitting] = useState(false);
  // const [isSubmitted, setIsSubmitted] = useState(false);

  return <Navigate to='/' replace />;

  // const form = useForm<ForgotPasswordFormValues>({
  //   resolver: zodResolver(forgotPasswordSchema),
  //   defaultValues: {
  //     email: "",
  //   },
  // });

  // const onSubmit = async (data: ForgotPasswordFormValues) => {
  //   try {
  //     setIsSubmitting(true);
  //     await console.log(data.email);
  //     setIsSubmitted(true);
  //   } catch (error) {
  //     console.error("Forgot password error:", error);
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  // if (isSubmitted) {
  //   return (
  //     <div className="w-full text-center">
  //       <h1 className="text-2xl font-bold mb-4">Check Your Email</h1>
  //       <p className="mb-6 text-muted-foreground">
  //         If an account exists with the email you provided, we've sent instructions to reset your password.
  //       </p>
  //       <Link to="/login">
  //         <Button variant="outline" className="mx-auto">
  //           Return to login
  //         </Button>
  //       </Link>
  //     </div>
  //   );
  // }

  // return (
  //   <div className="w-full">
  //     <h1 className="text-2xl font-bold mb-2">Forgot Password</h1>
  //     <p className="text-muted-foreground mb-6">
  //       Enter your email address and we'll send you a link to reset your password.
  //     </p>
  //     <Form {...form}>
  //       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
  //         <FormField
  //           control={form.control}
  //           name="email"
  //           render={({ field }) => (
  //             <FormItem>
  //               <FormLabel>Email</FormLabel>
  //               <FormControl>
  //                 <Input
  //                   placeholder="your@email.com"
  //                   type="email"
  //                   autoComplete="email"
  //                   {...field}
  //                 />
  //               </FormControl>
  //               <FormMessage />
  //             </FormItem>
  //           )}
  //         />
  //         <Button
  //           type="submit"
  //           className="w-full"
  //           disabled={isSubmitting}
  //         >
  //           {isSubmitting ? "Sending..." : "Send reset link"}
  //         </Button>
  //       </form>
  //     </Form>
  //     <div className="mt-6 text-center text-sm">
  //       Remember your password?{" "}
  //       <Link to="/login" className="text-primary hover:underline">
  //         Sign in
  //       </Link>
  //     </div>
  //   </div>
  // );
}
