# AutoMatch

Made for Hacktech 2025.

AutoMatch creates carpools by allowing a range of starting/ending locations to be specified.  Whenever there are overlapping ranges, users are given the option to accept the match and share a ride with the other person. If they both choose to do this, a start/end location shared by both users is automatically chosen and a chat window is opened to allow for further communication. AutoMatch respects users' privacy by not revealing identities until there is a match, and by avoiding using exact starting/ending locations.

## Web app
```
cd app
npm install
npm run dev
```

## Server
```
cd backend
npm run build
npm run serve
```
