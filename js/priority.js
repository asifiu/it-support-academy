/* Ticket priority from impact and urgency (ITIL style priority matrix).

   impact:  1 = high (whole company / many users), 2 = medium (a team), 3 = low (one user)
   urgency: 1 = high (work stopped, deadline now), 2 = medium, 3 = low (can wait)

   Return a number 1-4 meaning P1 (critical) ... P4 (low).
   The Ticket trainer uses this to show the priority of every ticket you work.

   Every company draws its matrix a little differently. Example ideas:
   - high + high is always P1
   - one low value makes it at most P3?
   - should "one user, but CEO meeting in 5 minutes" (impact 3, urgency 1) be P2 or P3?

   TODO(Asif): write the rule below (about 5-10 lines). Until you do, the trainer
   shows "priority rule not written yet". */
function calcPriority(impact, urgency) {
  return null;
}
