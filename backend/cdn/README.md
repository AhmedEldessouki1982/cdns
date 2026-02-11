┌─────────┐
│ Client │
└────┬────┘
│ login/register
v
┌──────────────┐
│ AuthService │
│ (bcrypt) │
└────┬─────────┘
│ JWT issued
v
┌──────────────┐
│ Client │
│ stores JWT │
└────┬─────────┘
│ Authorization: Bearer
v
┌──────────────┐
│ JwtAuthGuard │
└────┬─────────┘
│ validate
v
┌──────────────┐
│ JwtStrategy │
│ validate() │
└────┬─────────┘
│ req.user
v
┌──────────────┐
│ Controller │
│ Business API │
└──────────────┘

https://github.com/alexberce/openai-nestjs-template/blob/master/src/modules/ai/dto/code.completion.dto.ts

Get req for pagination => (http://localhost:3000/pagination?page=1)
Get search req => (http://localhost:3000/pagination/search?search=pp-001)
